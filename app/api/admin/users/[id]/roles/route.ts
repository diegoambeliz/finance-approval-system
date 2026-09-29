import { prisma } from "@/lib/prisma";
import { getDbUserOrThrow } from "@/server/auth";
import { requireRole } from "@/server/permissions";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { validationError } from "@/server/errors";
import { withApiErrors } from "@/server/apiHandler";

const BodySchema = z.object({
  roles: z.array(z.enum(["REQUESTER", "MANAGER", "FINANCE", "ADMIN"])).min(1),
});

export const PATCH = withApiErrors(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const me = await getDbUserOrThrow();
  requireRole(me, "ADMIN");

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    throw validationError("Invalid request.", parsed.error.flatten());
  }

  const roles = parsed.data.roles as Role[];

  if (id === me.id && !roles.includes("ADMIN")) {
    throw validationError("You cannot remove ADMIN from yourself.");
  }

  const updated = await prisma.user.update({
    where: { id },
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
});
