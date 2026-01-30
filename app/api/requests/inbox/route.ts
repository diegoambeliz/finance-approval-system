import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";

export async function GET() {
  const me = await getDbUserOrThrow();

  const isManager = me.roles.includes("MANAGER");
  const isFinance = me.roles.includes("FINANCE");

  if (!isManager && !isFinance) {
    return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const status = isManager ? "WAITING_FOR_MANAGER" : "WAITING_FOR_FINANCE";

  const requests = await prisma.financeRequest.findMany({
    where: { status },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
      type: true,
      title: true,
      amount: true,
      createdById: true,
      createdAt: true,
    },
  });

  return Response.json({ requests });
}
