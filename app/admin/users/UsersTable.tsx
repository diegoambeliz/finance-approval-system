"use client";

import { useMemo, useState } from "react";
import type { Role } from "@prisma/client";
import { updateUserRoles } from "./actions";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/States";
import { ActiveBadge } from "@/components/ui/Badge";

type UserRow = {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const ALL_ROLES: Role[] = ["REQUESTER", "MANAGER", "FINANCE", "ADMIN"];

function fmtDate(d: Date) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "";
  }
}

export default function UsersTable({ users, meId }: { users: UserRow[]; meId: string }) {
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  async function onToggleRole(userId: string, role: Role, checked: boolean) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    // Build next roles (must be >= 1)
    const next = checked
      ? Array.from(new Set([...user.roles, role]))
      : user.roles.filter((r) => r !== role);

    if (next.length === 0) {
      setError((p) => ({ ...p, [userId]: "A user must have at least one role." }));
      return;
    }

    // Prevent removing your own ADMIN (API also blocks, but better UX here)
    if (userId === meId && role === "ADMIN" && !checked) {
      setError((p) => ({ ...p, [userId]: "You cannot remove ADMIN from yourself." }));
      return;
    }

    setSaving((p) => ({ ...p, [userId]: true }));
    setError((p) => ({ ...p, [userId]: null }));
    setSaved((p) => ({ ...p, [userId]: false }));

    const res = await updateUserRoles(userId, next);

    if (!res.ok) {
      setError((p) => ({ ...p, [userId]: res.error }));
    } else {
      // NOTE: Because `users` is server-provided, the cleanest pattern is a refresh.
      // We’ll just reload the page to reflect changes (simple + reliable).
      setSaved((p) => ({ ...p, [userId]: true }));
      window.location.reload();
    }

    setSaving((p) => ({ ...p, [userId]: false }));
  }

  return (
    <Card>
      <div className="border-b border-border px-5 py-4">
        <label htmlFor="admin-users-search" className="sr-only">
          Search users by name, email, or id
        </label>
        <Input
          id="admin-users-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or id..."
        />
      </div>

      <Table minWidth={980}>
        <Thead>
          <Th>User</Th>
          <Th>Roles</Th>
          <Th>Status</Th>
          <Th>Created</Th>
          <Th>Updated</Th>
        </Thead>
        <tbody>
          {filtered.map((u) => (
            <Tr key={u.id}>
              <Td>
                <div className="font-medium text-ink">{u.name}</div>
                <div className="text-xs text-muted">{u.email}</div>
                <div className="text-[11px] text-muted/80">{u.id}</div>
              </Td>

              <Td>
                <div className="flex flex-wrap gap-2.5">
                  {ALL_ROLES.map((role) => {
                    const checked = u.roles.includes(role);
                    const disabled =
                      saving[u.id] ||
                      (u.id === meId && role === "ADMIN" && checked); // still allow uncheck? we block UX in handler

                    return (
                      <label
                        key={role}
                        className={`inline-flex items-center gap-2 rounded-pill border px-2.5 py-1.5 text-[13px] transition-colors ${
                          checked ? "border-accent bg-accent-soft text-accent" : "border-border bg-card text-ink"
                        } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={saving[u.id]}
                          onChange={(e) => onToggleRole(u.id, role, e.target.checked)}
                        />
                        <span>{role}</span>
                      </label>
                    );
                  })}
                </div>

                {error[u.id] ? <div className="mt-2 text-xs text-danger">{error[u.id]}</div> : null}

                {saved[u.id] ? <div className="mt-2 text-xs text-success">Saved.</div> : null}
              </Td>

              <Td>
                <ActiveBadge isActive={u.isActive} />
              </Td>

              <Td>{fmtDate(u.createdAt)}</Td>
              <Td>{fmtDate(u.updatedAt)}</Td>
            </Tr>
          ))}

          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState title="No users match your search." />
              </td>
            </tr>
          ) : null}
        </tbody>
      </Table>
    </Card>
  );
}
