"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

type Row = {
  id: string;
  status: string;
  type: string;
  title: string | null;
  amount: number | null;
  createdAt: string;
};

type Queues = { manager: Row[] | null; finance: Row[] | null };

export default function InboxTables({
  initial,
  isManager,
  isFinance,
}: {
  initial: Queues | null;
  isManager: boolean;
  isFinance: boolean;
}) {
  const [queues, setQueues] = useState<Queues | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { ok, data } = await apiFetch<{ queues: Queues; error?: { message: string } }>(
      "/api/requests/inbox",
      { method: "GET" }
    );

    setLoading(false);

    if (!ok) {
      setError(data?.error?.message ?? "Failed to load inbox.");
      return;
    }

    setQueues(data?.queues ?? null);
  }

  useEffect(() => {
    if (!initial) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div style={{ padding: 14 }}>Loading…</div>;
  if (error) return <div style={{ padding: 14, color: "#b00020" }}>{error}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {isManager ? (
        <Queue
          title="Waiting for Manager Review"
          rows={queues?.manager ?? []}
          onRefresh={load}
        />
      ) : null}

      {isFinance ? (
        <Queue
          title="Waiting for Finance Review"
          rows={queues?.finance ?? []}
          onRefresh={load}
        />
      ) : null}
    </div>
  );
}

function Queue({ title, rows, onRefresh }: { title: string; rows: Row[]; onRefresh: () => void }) {
  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <button
          onClick={onRefresh}
          style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
        >
          Refresh
        </button>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: 14 }}>
          No requests waiting for your review.
          <br />
          <span style={{ opacity: 0.7 }}>You&apos;re all caught up.</span>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
                <th style={th}>Request</th>
                <th style={th}>Type</th>
                <th style={th}>Amount</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={td}>{r.title ?? <span style={{ opacity: 0.6 }}>(untitled)</span>}</td>
                  <td style={td}>{r.type}</td>
                  <td style={td}>{r.amount == null ? <span style={{ opacity: 0.6 }}>(empty)</span> : `$${r.amount}`}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <Link
                      href={`/app/requests/${r.id}`}
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: 10,
                        border: "1px solid #111",
                        background: "#111",
                        color: "#fff",
                        fontWeight: 700,
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
