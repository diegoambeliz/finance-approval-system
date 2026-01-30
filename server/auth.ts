import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getDbUserOrThrow() {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) throw new Error("USER_NOT_SYNCED");

  return dbUser;
}
