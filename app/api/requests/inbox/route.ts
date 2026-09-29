import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { forbidden } from "@/server/errors";
import { withApiErrors } from "@/server/apiHandler";

const SELECT = {
  id: true,
  status: true,
  type: true,
  title: true,
  amount: true,
  createdById: true,
  createdAt: true,
} as const;

export const GET = withApiErrors(async () => {
  const me = await getDbUserOrThrow();

  const isManager = me.roles.includes("MANAGER");
  const isFinance = me.roles.includes("FINANCE");

  if (!isManager && !isFinance) {
    throw forbidden("You don't have permission to view the approval inbox.");
  }

  const [managerRequests, financeRequests] = await Promise.all([
    isManager
      ? prisma.financeRequest.findMany({
          where: { status: "WAITING_FOR_MANAGER" },
          orderBy: { createdAt: "asc" },
          select: SELECT,
        })
      : Promise.resolve(null),
    isFinance
      ? prisma.financeRequest.findMany({
          where: { status: "WAITING_FOR_FINANCE" },
          orderBy: { createdAt: "asc" },
          select: SELECT,
        })
      : Promise.resolve(null),
  ]);

  return Response.json({
    queues: {
      manager: managerRequests,
      finance: financeRequests,
    },
  });
});
