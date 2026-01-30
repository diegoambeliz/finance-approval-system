"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["PURCHASE", "REIMBURSEMENT", "SUBSCRIPTION", "INVOICE_PAYMENT"] as const;

export default function NewRequestButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof TYPES)[number]>("PURCHASE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createDraft() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });

    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Failed to create draft.");
      return;
    }

    const id = data?.request?.id;
    if (!id) {
      setError("Draft created but missing id.");
      return;
    }

    setOpen(false);
    router.push(`/app/requests/${id}`);
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ddd",
          background: "#fff",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        + New Request
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 46,
            width: 320,
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "#fff",
            padding: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Create draft</div>

          <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {error ? <div style={{ marginTop: 10, color: "#b00020", fontSize: 12 }}>{error}</div> : null}

          <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
            <button
              onClick={() => setOpen(false)}
              disabled={loading}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
            >
              Cancel
            </button>
            <button
              onClick={createDraft}
              disabled={loading}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                fontWeight: 800,
              }}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
