import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { forbidden, unauthenticated } from "./errors";

export async function getDbUserOrThrow() {
  const { userId } = await auth();

  if (!userId) throw unauthenticated();

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) throw forbidden("Your account isn't set up yet. Please contact an administrator.");

  return dbUser;
}
