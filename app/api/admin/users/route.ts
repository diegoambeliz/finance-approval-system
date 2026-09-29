import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { requireRole } from "@/server/permissions";
import { withApiErrors } from "@/server/apiHandler";

export const GET = withApiErrors(async () => {
  const me = await getDbUserOrThrow();
  requireRole(me, "ADMIN");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      roles: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({ users });
});
