import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { requireRole } from "@/server/permissions";
import { z } from "zod";
import type { Role } from "@prisma/client";

const BodySchema = z.object({
  roles: z.array(z.enum(["REQUESTER", "MANAGER", "FINANCE", "ADMIN"])).min(1),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const me = await getDbUserOrThrow();
  requireRole(me, "ADMIN");

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const roles = parsed.data.roles as Role[];

  if (params.id === me.id && !roles.includes("ADMIN")) {
    return Response.json(
      { error: "You cannot remove ADMIN from yourself." },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: (await params).id },
    data: { roles },
    select: {
      id: true,
      email: true,
      name: true,
      roles: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return Response.json({ user: updated });
}
