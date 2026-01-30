"use client";

import { useEffect, useMemo, useState } from "react";
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
  expenseDate?: string | null; // ISO
  billingCycle?: string | null;
  invoiceNumber?: string | null;

  decisions?: any[];
};

export default function RequestEditor({ requestId, initial }: { requestId: string; initial: Req | null }) {
  const router = useRouter();

  const [req, setReq] = useState<Req | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/requests/${requestId}`);
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Failed to load request.");
      return;
    }
    setReq(data.request);
  }

  useEffect(() => {
    if (!initial) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDraft = req?.status === "DRAFT";

  const missing = useMemo(() => {
    if (!req) return [];
    const m: string[] = [];
    if (!req.title || req.title.trim().length < 3) m.push("title");
    if (req.amount == null || req.amount <= 0) m.push("amount");
    if (!req.reason || req.reason.trim().length === 0) m.push("reason");
    if (!req.vendor || req.vendor.trim().length === 0) m.push("vendor");
    if (!req.costCenter || req.costCenter.trim().length === 0) m.push("costCenter");
    return m;
  }, [req]);

  function updateField<K extends keyof Req>(key: K, value: Req[K]) {
    if (!req) return;
    setReq({ ...req, [key]: value });
  }

  async function save() {
    if (!req) return;
    setSaving(true);
    setError(null);
    setNotice(null);

    const res = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: req.title ?? undefined,
        amount: req.amount ?? undefined,
        reason: req.reason ?? undefined,
        vendor: req.vendor ?? undefined,
        costCenter: req.costCenter ?? undefined,
        invoiceNumber: req.invoiceNumber ?? undefined,
        billingCycle: req.billingCycle ?? undefined,
        // NOTE: we keep expenseDate simple for now; add later if needed
      }),
    });

    const data = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) {
      setError(data?.error ?? "Failed to save.");
      return;
    }

    setNotice("Saved.");
    setReq((prev) => (prev ? { ...prev, ...data.request } : prev));
    router.refresh();
  }

  async function submit() {
    if (!req) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);

    const res = await fetch(`/api/requests/${requestId}/submit`, { method: "POST" });
    const data = await res.json().catch(() => null);

    setSubmitting(false);

    if (!res.ok) {
      setError(data?.error ?? "Failed to submit.");
      return;
    }

    setNotice("Submitted.");
    await load();
    router.refresh();
  }

  if (loading) return <div style={{ padding: 14 }}>Loading…</div>;
  if (error && !req) return <div style={{ padding: 14, color: "#b00020" }}>{error}</div>;
  if (!req) return <div style={{ padding: 14 }}>Not found.</div>;

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>ID</div>
          <div style={{ fontWeight: 800 }}>{req.id}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Status</div>
          <div style={{ fontWeight: 800 }}>{req.status}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Type</div>
          <div style={{ fontWeight: 800 }}>{req.type}</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Title">
          <input
            value={req.title ?? ""}
            onChange={(e) => updateField("title", e.target.value)}
            disabled={!isDraft}
            style={input}
            placeholder="e.g., New laptop for development"
          />
        </Field>

        <Field label="Amount (USD)">
          <input
            type="number"
            value={req.amount ?? ""}
            onChange={(e) => updateField("amount", e.target.value === "" ? null : Number(e.target.value))}
            disabled={!isDraft}
            style={input}
            placeholder="e.g., 2400"
          />
        </Field>

        <Field label="Vendor">
          <input
            value={req.vendor ?? ""}
            onChange={(e) => updateField("vendor", e.target.value)}
            disabled={!isDraft}
            style={input}
            placeholder="e.g., Apple"
          />
        </Field>

        <Field label="Cost Center">
          <input
            value={req.costCenter ?? ""}
            onChange={(e) => updateField("costCenter", e.target.value)}
            disabled={!isDraft}
            style={input}
            placeholder="e.g., Engineering"
          />
        </Field>

        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Reason">
            <textarea
              value={req.reason ?? ""}
              onChange={(e) => updateField("reason", e.target.value)}
              disabled={!isDraft}
              style={{ ...input, minHeight: 110 }}
              placeholder="Why is this needed? What’s the business justification?"
            />
          </Field>
        </div>
      </div>

      {missing.length > 0 && isDraft ? (
        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
          Missing required fields for submit: <b>{missing.join(", ")}</b>
        </div>
      ) : null}

      {error ? <div style={{ marginTop: 10, color: "#b00020", fontSize: 12 }}>{error}</div> : null}
      {notice ? <div style={{ marginTop: 10, color: "#0a7a2f", fontSize: 12 }}>{notice}</div> : null}

      <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button onClick={load} style={btnSecondary}>
          Reload
        </button>

        <button onClick={save} disabled={!isDraft || saving} style={btnSecondary}>
          {saving ? "Saving..." : "Save draft"}
        </button>

        <button
          onClick={submit}
          disabled={!isDraft || submitting || missing.length > 0}
          style={btnPrimary}
          title={missing.length > 0 ? "Fill required fields before submit" : "Submit for approval"}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
};

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
