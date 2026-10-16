import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { requireRole } from "@/server/permissions";
import UsersTable from "./UsersTable";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
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

  return (
    <main>
      <PageHeader
        title="Users & Roles"
        subtitle="Manage role assignments. A user can have multiple roles (e.g., ADMIN + MANAGER)."
      />

      <UsersTable users={users} meId={me.id} />
    </main>
  );
}
