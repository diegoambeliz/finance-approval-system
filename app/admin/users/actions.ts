import type { Role } from "@prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateUserRoles(userId: string, roles: Role[]): Promise<ActionResult> {
  try {
    const res = await fetch(`/api/admin/users/${userId}/roles`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { ok: false, error: data?.error ?? `Request failed (${res.status})` };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
