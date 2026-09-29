"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Req = {
  id: string;
  status: string;
  type: string;

  title: string | null;
  amount: number | null;
  reason: string | null;

  vendor?: string | null;
  costCenter?: string | null;
  expenseDate?: string | null;
  billingCycle?: string | null;
  invoiceNumber?: string | null;
};

// Mirrors the type-specific fields documented in domain/types.ts
const TYPE_FIELDS: Record<string, (keyof Req)[]> = {
  PURCHASE: ["vendor", "costCenter"],
  REIMBURSEMENT: ["expenseDate"],
  SUBSCRIPTION: ["vendor", "billingCycle"],
  INVOICE_PAYMENT: ["vendor", "invoiceNumber"],
};

const FIELD_LABELS: Record<string, string> = {
  vendor: "Vendor",
  costCenter: "Cost Center",
  expenseDate: "Expense Date",
  billingCycle: "Billing Cycle",
  invoiceNumber: "Invoice Number",
};

const DECISION_ERROR_MESSAGES: Record<string, string> = {
  FORBIDDEN_OR_WRONG_STATUS:
    "You can no longer act on this request — it may already have been decided, or you may not have permission.",
  INVALID_STATE: "This request is no longer in a state that can be decided.",
};

export default function RequestReviewPanel({
  requestId,
  initial,
  isManager,
  isFinance,
}: {
  requestId: string;
  initial: Req | null;
  isManager: boolean;
  isFinance: boolean;
}) {
  const router = useRouter();

  const [req, setReq] = useState<Req | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function load() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/requests/${requestId}`);
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      if (res.status === 403) {
        setError("You don't have permission to review this request.");
      } else if (res.status === 404) {
        setError("Request not found.");
      } else {
        setError(data?.error ?? "Failed to load request.");
      }
      return;
    }
    setReq(data.request);
  }

  useEffect(() => {
    if (!initial) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function decide(action: "APPROVE" | "REJECT", reason?: string) {
    setDeciding(true);
    setError(null);
    setNotice(null);

    const res = await fetch(`/api/requests/${requestId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    const data = await res.json().catch(() => null);
    setDeciding(false);

    if (!res.ok) {
      setError(DECISION_ERROR_MESSAGES[data?.error] ?? data?.error ?? "Failed to submit decision.");
      return;
    }

    setNotice(action === "APPROVE" ? "Request approved." : "Request rejected.");
    setShowReject(false);
    setRejectReason("");
    await load();
    router.refresh();
  }

  if (loading) return <div style={{ padding: 14 }}>Loading…</div>;
  if (error && !req) return <div style={{ padding: 14, color: "#b00020" }}>{error}</div>;
  if (!req) return <div style={{ padding: 14 }}>Not found.</div>;

  const canDecide =
    (isManager && req.status === "WAITING_FOR_MANAGER") || (isFinance && req.status === "WAITING_FOR_FINANCE");
  const relevantFields = TYPE_FIELDS[req.type] ?? [];

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>ID</div>
          <div style={{ fontWeight: 800 }}>{req.id}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Status</div>
          <div style={{ fontWeight: 800 }}>{req.status.replaceAll("_", " ")}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Type</div>
          <div style={{ fontWeight: 800 }}>{req.type}</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <ReadField label="Title" value={req.title} />
        <ReadField label="Amount" value={req.amount == null ? null : `$${req.amount}`} />

        {relevantFields.map((f) => (
          <ReadField key={f} label={FIELD_LABELS[f]} value={(req[f] as string | null | undefined) ?? null} />
        ))}

        <div style={{ gridColumn: "1 / -1" }}>
          <ReadField label="Reason" value={req.reason} multiline />
        </div>
      </div>

      {error ? <div style={{ marginTop: 10, color: "#b00020", fontSize: 12 }}>{error}</div> : null}
      {notice ? <div style={{ marginTop: 10, color: "#0a7a2f", fontSize: 12 }}>{notice}</div> : null}

      {canDecide ? (
        showReject ? (
          <div style={{ marginTop: 14, border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Reject request</div>

            <label style={{ display: "block", fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", minHeight: 80 }}
              placeholder="e.g., Cost center does not have sufficient budget."
              maxLength={500}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowReject(false)} disabled={deciding} style={btnSecondary}>
                Cancel
              </button>
              <button
                onClick={() => decide("REJECT", rejectReason.trim())}
                disabled={deciding || rejectReason.trim().length === 0}
                style={btnDanger}
              >
                {deciding ? "Rejecting..." : "Reject Request"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
            <button onClick={() => setShowReject(true)} disabled={deciding} style={btnDanger}>
              Reject
            </button>
            <button onClick={() => decide("APPROVE")} disabled={deciding} style={btnPrimary}>
              {deciding ? "Approving..." : "Approve"}
            </button>
          </div>
        )
      ) : null}
    </section>
  );
}

function ReadField({ label, value, multiline }: { label: string; value: string | null; multiline?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>{label}</div>
      <div style={{ whiteSpace: multiline ? "pre-wrap" : "nowrap" }}>
        {value ?? <span style={{ opacity: 0.6 }}>(empty)</span>}
      </div>
    </div>
  );
}

const btnSecondary: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #b00020",
  background: "#fff",
  color: "#b00020",
  fontWeight: 800,
  cursor: "pointer",
};
