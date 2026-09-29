import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { dbToDomainRequest } from "@/server/requests/mapper";
import { canManagerDecide, canFinanceDecide } from "@/domain/rules";
import { applyManagerDecision, applyFinanceDecision } from "@/domain/transitions";
import { DecisionSchema } from "@/server/requests/validators";
import { conflict, forbidden, invalidState, notFound, validationError } from "@/server/errors";
import { withApiErrors } from "@/server/apiHandler";

export const POST = withApiErrors(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const me = await getDbUserOrThrow();

  const existing = await prisma.financeRequest.findUnique({ where: { id } });
  if (!existing) throw notFound("This request doesn't exist.");

  const body = await req.json().catch(() => null);
  const parsed = DecisionSchema.safeParse(body);
  if (!parsed.success) {
    throw validationError("Invalid request.", parsed.error.flatten());
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
      throw invalidState("This request is no longer waiting for manager review.");
    }

    const result = await prisma.$transaction(async (tx) => {
      // Atomic guard: the update only applies if status is still what we
      // validated against. A concurrent decision on the same request (two
      // managers, or a duplicate request) will find zero rows here instead
      // of silently overwriting an already-decided request.
      const { count } = await tx.financeRequest.updateMany({
        where: { id, status: domainReq.status },
        data: { status: next.status },
      });

      if (count === 0) {
        throw conflict("This request was already decided by someone else. Please refresh and try again.");
      }

      await tx.decision.create({
        data: {
          requestId: id,
          step: "MANAGER",
          action: parsed.data.action,
          reason: parsed.data.reason ?? null,
          decidedById: me.id,
        },
      });

      return { id, status: next.status };
    });

    return Response.json({ request: result });
  }

  if (isFinance && canFinanceDecide(domainUser, domainReq)) {
    let next;
    try {
      next = applyFinanceDecision({ req: domainReq, action: parsed.data.action });
    } catch {
      throw invalidState("This request is no longer waiting for finance review.");
    }

    const result = await prisma.$transaction(async (tx) => {
      const { count } = await tx.financeRequest.updateMany({
        where: { id, status: domainReq.status },
        data: { status: next.status },
      });

      if (count === 0) {
        throw conflict("This request was already decided by someone else. Please refresh and try again.");
      }

      await tx.decision.create({
        data: {
          requestId: id,
          step: "FINANCE",
          action: parsed.data.action,
          reason: parsed.data.reason ?? null,
          decidedById: me.id,
        },
      });

      return { id, status: next.status };
    });

    return Response.json({ request: result });
  }

  throw forbidden("You don't have permission to decide on this request right now.");
});
