import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { CreateDraftSchema } from "@/server/requests/validators";

export async function POST(req: Request) {
  const me = await getDbUserOrThrow();

  // only REQUESTER can create
  if (!me.roles.includes("REQUESTER")) {
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateDraftSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.financeRequest.create({
    data: {
      createdById: me.id,
      status: "DRAFT",
      type: parsed.data.type,
      
      title: null!,
      amount: null!,
      reason: null!,
    },
    select: { id: true, status: true, type: true },
  });

  return Response.json({ request: created }, { status: 201 });
}

export async function GET() {
  const me = await getDbUserOrThrow();

  const isPrivileged = me.roles.some((r) => r === "ADMIN" || r === "MANAGER" || r === "FINANCE");

  const requests = await prisma.financeRequest.findMany({
    where: isPrivileged ? {} : { createdById: me.id },
    orderBy: { createdAt: "desc" },
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
}
