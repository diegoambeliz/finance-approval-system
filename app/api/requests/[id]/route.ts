import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { UpdateDraftSchema } from "@/server/requests/validators";
import { forbidden, invalidState, notFound, validationError } from "@/server/errors";
import { withApiErrors } from "@/server/apiHandler";

export const GET = withApiErrors(async (_: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const me = await getDbUserOrThrow();

  const request = await prisma.financeRequest.findUnique({
    where: { id },
    include: {
      decisions: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          step: true,
          action: true,
          reason: true,
          decidedById: true,
          decidedBy: { select: { name: true } },
          createdAt: true,
        },
      },
    },
  });

  if (!request) throw notFound("This request doesn't exist.");

  const isPrivileged = me.roles.some((r) => r === "ADMIN" || r === "MANAGER" || r === "FINANCE");
  const canView = isPrivileged || request.createdById === me.id;

  if (!canView) throw forbidden("You don't have permission to view this request.");

  return Response.json({ request });
});

export const PATCH = withApiErrors(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const me = await getDbUserOrThrow();

  const existing = await prisma.financeRequest.findUnique({ where: { id } });
  if (!existing) throw notFound("This request doesn't exist.");

  // only owner + REQUESTER can edit drafts
  if (existing.createdById !== me.id || !me.roles.includes("REQUESTER")) {
    throw forbidden("You don't have permission to edit this request.");
  }
  if (existing.status !== "DRAFT") {
    throw invalidState("Only draft requests can be edited.");
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateDraftSchema.safeParse(body);
  if (!parsed.success) {
    throw validationError("Invalid request.", parsed.error.flatten());
  }

  const data = parsed.data;

  const updated = await prisma.financeRequest.update({
    where: { id },
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
});
