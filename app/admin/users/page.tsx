import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { requireRole } from "@/server/permissions";
import UsersTable from "./UsersTable";

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
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Admin — Users & Roles
      </h1>
      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Manage role assignments. A user can have multiple roles (e.g., ADMIN + MANAGER).
      </p>

      <UsersTable users={users} meId={me.id} />
    </main>
  );
}
