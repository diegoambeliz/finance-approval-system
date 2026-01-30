import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { dbToDomainRequest } from "@/server/requests/mapper";
import { canSubmit } from "@/domain/rules";
import { submitRequest } from "@/domain/transitions";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const me = await getDbUserOrThrow();

  const existing = await prisma.financeRequest.findUnique({ where: { id: params.id } });
  if (!existing) return Response.json({ error: "NOT_FOUND" }, { status: 404 });

  // Domain rule check
  const domainReq = dbToDomainRequest(existing);
  const domainUser = { id: me.id, roles: me.roles as any };

  const allowed = canSubmit(domainUser, domainReq);
  if (!allowed.ok) {
    return Response.json({ error: "CANNOT_SUBMIT", details: allowed.errors }, { status: 400 });
  }

  // Transition (throws only if status invalid)
  let next;
  try {
    next = submitRequest(domainReq);
  } catch {
    return Response.json({ error: "INVALID_STATE" }, { status: 409 });
  }

  const updated = await prisma.financeRequest.update({
    where: { id: params.id },
    data: { status: next.status },
    select: { id: true, status: true },
  });

  return Response.json({ request: updated });
}
