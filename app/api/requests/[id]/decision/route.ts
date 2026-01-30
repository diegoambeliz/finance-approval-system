import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { dbToDomainRequest } from "@/server/requests/mapper";
import { canManagerDecide, canFinanceDecide } from "@/domain/rules";
import { applyManagerDecision, applyFinanceDecision } from "@/domain/transitions";
import { DecisionSchema } from "@/server/requests/validators";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await getDbUserOrThrow();

  const existing = await prisma.financeRequest.findUnique({ where: { id: params.id } });
  if (!existing) return Response.json({ error: "NOT_FOUND" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = DecisionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const domainReq = dbToDomainRequest(existing);
  const domainUser = { id: me.id, roles: me.roles as any };

  const isManager = me.roles.includes("MANAGER");
  const isFinance = me.roles.includes("FINANCE");

  // Decide which step applies
  if (isManager && canManagerDecide(domainUser, domainReq)) {
    let next;
    try {
      next = applyManagerDecision({ req: domainReq, action: parsed.data.action });
    } catch {
      return Response.json({ error: "INVALID_STATE" }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.financeRequest.update({
        where: { id: params.id },
        data: { status: next.status },
        select: { id: true, status: true },
      });

      await tx.decision.create({
        data: {
          requestId: params.id,
          step: "MANAGER",
          action: parsed.data.action,
          reason: parsed.data.reason ?? null,
          decidedById: me.id,
        },
      });

      return updated;
    });

    return Response.json({ request: result });
  }

  if (isFinance && canFinanceDecide(domainUser, domainReq)) {
    let next;
    try {
      next = applyFinanceDecision({ req: domainReq, action: parsed.data.action });
    } catch {
      return Response.json({ error: "INVALID_STATE" }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.financeRequest.update({
        where: { id: params.id },
        data: { status: next.status },
        select: { id: true, status: true },
      });

      await tx.decision.create({
        data: {
          requestId: params.id,
          step: "FINANCE",
          action: parsed.data.action,
          reason: parsed.data.reason ?? null,
          decidedById: me.id,
        },
      });

      return updated;
    });

    return Response.json({ request: result });
  }

  return Response.json({ error: "FORBIDDEN_OR_WRONG_STATUS" }, { status: 403 });
}
