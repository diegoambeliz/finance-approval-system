import type { Role, User } from "@prisma/client";
import { forbidden } from "./errors";

export function requireRole(user: User, role: Role) {
  if (!user.roles.includes(role)) throw forbidden(`This action requires the ${role} role.`);
}