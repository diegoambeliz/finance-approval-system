import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { dbToDomainRequest } from "@/server/requests/mapper";
import { canSubmit } from "@/domain/rules";
import { submitRequest } from "@/domain/transitions";
import { invalidState, notFound, validationError } from "@/server/errors";
import { withApiErrors } from "@/server/apiHandler";

export const POST = withApiErrors(async (_: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const me = await getDbUserOrThrow();

  const existing = await prisma.financeRequest.findUnique({ where: { id } });
  if (!existing) throw notFound("This request doesn't exist.");

  // Domain rule check
  const domainReq = dbToDomainRequest(existing);
  const domainUser = { id: me.id, roles: me.roles as any };

  const allowed = canSubmit(domainUser, domainReq);
  if (!allowed.ok) {
    throw validationError("This request can't be submitted yet.", allowed.errors);
  }

  // Transition (throws only if status invalid)
  let next;
  try {
    next = submitRequest(domainReq);
  } catch {
    throw invalidState("This request can no longer be submitted.");
  }

  const updated = await prisma.financeRequest.update({
    where: { id },
    data: { status: next.status },
    select: { id: true, status: true },
  });

  return Response.json({ request: updated });
});
