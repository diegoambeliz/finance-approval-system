"use client";

import { useMemo, useState } from "react";
import type { Role } from "@prisma/client";
import { updateUserRoles } from "./actions";

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
    let next = checked
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
    <section style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", gap: 12 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or id..."
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
            outline: "none",
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead>
            <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
              <th style={th}>User</th>
              <th style={th}>Roles</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
              <th style={th}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{u.email}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{u.id}</div>
                </td>

                <td style={td}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {ALL_ROLES.map((role) => {
                      const checked = u.roles.includes(role);
                      const disabled =
                        saving[u.id] ||
                        (u.id === meId && role === "ADMIN" && checked); // still allow uncheck? we block UX in handler

                      return (
                        <label
                          key={role}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 10px",
                            border: "1px solid #ddd",
                            borderRadius: 999,
                            background: checked ? "#f3f3f3" : "transparent",
                            opacity: disabled ? 0.7 : 1,
                            cursor: disabled ? "not-allowed" : "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={saving[u.id]}
                            onChange={(e) => onToggleRole(u.id, role, e.target.checked)}
                          />
                          <span style={{ fontSize: 13 }}>{role}</span>
                        </label>
                      );
                    })}
                  </div>

                  {error[u.id] ? (
                    <div style={{ marginTop: 8, color: "#b00020", fontSize: 12 }}>
                      {error[u.id]}
                    </div>
                  ) : null}

                  {saved[u.id] ? (
                    <div style={{ marginTop: 8, color: "#0a7a2f", fontSize: 12 }}>
                      Saved.
                    </div>
                  ) : null}
                </td>

                <td style={td}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      background: u.isActive ? "#fff" : "#fff3f3",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>

                <td style={td}>{fmtDate(u.createdAt)}</td>
                <td style={td}>{fmtDate(u.updatedAt)}</td>
              </tr>
            ))}

            {filtered.length === 0 ? (
              <tr>
                <td style={{ ...td, padding: 18 }} colSpan={5}>
                  No users match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  opacity: 0.7,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: 12,
  verticalAlign: "top",
};
