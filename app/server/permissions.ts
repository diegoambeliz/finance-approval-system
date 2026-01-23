import type { Role, User } from "@prisma/client";

export function requireRole(user: User, role: Role) {
  if (!user.roles.includes(role)) throw new Error("FORBIDDEN");
}