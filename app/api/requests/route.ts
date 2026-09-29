import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { CreateDraftSchema } from "@/server/requests/validators";
import { forbidden, validationError } from "@/server/errors";
import { withApiErrors } from "@/server/apiHandler";

export const POST = withApiErrors(async (req: Request) => {
  const me = await getDbUserOrThrow();

  // only REQUESTER can create
  if (!me.roles.includes("REQUESTER")) {
    throw forbidden("Only requesters can create finance requests.");
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateDraftSchema.safeParse(body);
  if (!parsed.success) {
    throw validationError("Invalid request.", parsed.error.flatten());
  }

  const created = await prisma.financeRequest.create({
    data: {
       createdBy: {
      connect: { id: me.id },
    },
      status: "DRAFT",
      type: parsed.data.type,

      title: null!,
      amount: null!,
      reason: null!,
    },
    select: { id: true, status: true, type: true },
  });

  return Response.json({ request: created }, { status: 201 });
});

export const GET = withApiErrors(async () => {
  const me = await getDbUserOrThrow();

  const isPrivileged = me.roles.some((r) => r === "ADMIN" || r === "MANAGER" || r === "FINANCE");

  const requests = await prisma.financeRequest.findMany({
    where: isPrivileged ? {} : { createdById: me.id },
    orderBy: { createdAt: "desc" },
    // Safety cap, not real pagination - this list has no UI for paging yet.
    // Prevents an unbounded scan/response once the table has real volume.
    take: 200,
    select: {
      id: true,
      status: true,
      type: true,
      title: true,
      amount: true,
      createdById: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({ requests });
});
