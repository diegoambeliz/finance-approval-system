"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  status: string;
  type: string;
  title: string | null;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
};

export default function RequestsTable({ initial }: { initial: Row[] | null }) {
  const [rows, setRows] = useState<Row[] | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/requests", { method: "GET" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Failed to load requests.");
      return;
    }

    setRows(data.requests ?? []);
  }

  useEffect(() => {
    if (!initial) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800 }}>Requests</div>
        <button
          onClick={load}
          style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
        >
          Refresh
        </button>
      </div>

      {loading ? <div style={{ padding: 14 }}>Loading…</div> : null}
      {error ? <div style={{ padding: 14, color: "#b00020" }}>{error}</div> : null}

      {!loading && !error ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
                <th style={th}>ID</th>
                <th style={th}>Status</th>
                <th style={th}>Type</th>
                <th style={th}>Title</th>
                <th style={th}>Amount</th>
                <th style={th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={td}>
                    <Link href={`/app/requests/${r.id}`} style={{ fontWeight: 800 }}>
                      {r.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td style={td}>{r.status}</td>
                  <td style={td}>{r.type}</td>
                  <td style={td}>{r.title ?? <span style={{ opacity: 0.6 }}>(empty)</span>}</td>
                  <td style={td}>{r.amount == null ? <span style={{ opacity: 0.6 }}>(empty)</span> : `$${r.amount}`}</td>
                  <td style={td}>{new Date(r.updatedAt).toLocaleString()}</td>
                </tr>
              ))}

              {(rows ?? []).length === 0 ? (
                <tr>
                  <td style={{ padding: 14 }} colSpan={6}>
                    No requests yet. Create a new draft.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
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
