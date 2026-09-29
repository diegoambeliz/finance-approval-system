import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { requireRole } from "@/server/permissions";
import { withApiErrors } from "@/server/apiHandler";

export const GET = withApiErrors(async () => {
  const me = await getDbUserOrThrow();
  requireRole(me, "ADMIN");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    // Safety cap, not real pagination - this list has no UI for paging yet.
    // Prevents an unbounded scan/response once the table has real volume.
    take: 200,
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
