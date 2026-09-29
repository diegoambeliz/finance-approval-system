import type { Role } from "@prisma/client";
import { apiFetch } from "@/lib/apiFetch";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateUserRoles(userId: string, roles: Role[]): Promise<ActionResult> {
  const { ok, status, data } = await apiFetch<{ error?: { message: string } }>(
    `/api/admin/users/${userId}/roles`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles }),
    }
  );

  if (!ok) {
    return { ok: false, error: data?.error?.message ?? `Request failed (${status})` };
  }

  return { ok: true };
}
