import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { forbidden, unauthenticated } from "./errors";

export async function getDbUserOrThrow() {
  const { userId } = await auth();

  if (!userId) throw unauthenticated();

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) throw forbidden("Your account isn't set up yet. Please contact an administrator.");
  if (!dbUser.isActive) throw forbidden("Your account has been disabled. Please contact an administrator.");

  return dbUser;
}

export async function getNavFlags() {
  const me = await getDbUserOrThrow().catch(() => null);

  return {
    me,
    canReview: !!me && (me.roles.includes("MANAGER") || me.roles.includes("FINANCE")),
    isAdmin: !!me && me.roles.includes("ADMIN"),
  };
}
