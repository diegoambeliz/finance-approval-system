import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { UpdateDraftSchema } from "@/server/requests/validators";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const me = await getDbUserOrThrow();

  const request = await prisma.financeRequest.findUnique({
    where: { id: params.id },
    include: {
      decisions: {
        orderBy: { createdAt: "asc" },
        select: { id: true, step: true, action: true, reason: true, decidedById: true, createdAt: true },
      },
    },
  });

  if (!request) return Response.json({ error: "NOT_FOUND" }, { status: 404 });

  const isPrivileged = me.roles.some((r) => r === "ADMIN" || r === "MANAGER" || r === "FINANCE");
  const canView = isPrivileged || request.createdById === me.id;

  if (!canView) return Response.json({ error: "FORBIDDEN" }, { status: 403 });

  return Response.json({ request });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await getDbUserOrThrow();

  const existing = await prisma.financeRequest.findUnique({ where: { id: params.id } });
  if (!existing) return Response.json({ error: "NOT_FOUND" }, { status: 404 });

  // only owner + REQUESTER can edit drafts
  if (existing.createdById !== me.id || !me.roles.includes("REQUESTER")) {
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  if (existing.status !== "DRAFT") {
    return Response.json({ error: "ONLY_DRAFT_CAN_BE_EDITED" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateDraftSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const updated = await prisma.financeRequest.update({
    where: { id: params.id },
    data: {
      ...("title" in data ? { title: data.title ?? existing.title ?? null } : {}),
      ...("amount" in data ? { amount: data.amount ?? existing.amount ?? null } : {}),
      ...("reason" in data ? { reason: data.reason ?? existing.reason ?? null } : {}),

      vendor: data.vendor ?? existing.vendor,
      costCenter: data.costCenter ?? existing.costCenter,
      billingCycle: data.billingCycle ?? existing.billingCycle,
      invoiceNumber: data.invoiceNumber ?? existing.invoiceNumber,
      expenseDate: data.expenseDate ? new Date(data.expenseDate) : existing.expenseDate,
    },
    select: { id: true, status: true, type: true, title: true, amount: true, updatedAt: true },
  });

  return Response.json({ request: updated });
}
