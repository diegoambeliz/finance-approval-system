"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TYPE_FIELDS } from "../typeFields";
import { apiFetch } from "@/lib/apiFetch";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/Badge";
import type { Decision } from "./DecisionsTimeline";

function isBlank(v: unknown): boolean {
  return typeof v !== "string" || v.trim().length === 0;
}

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

  decisions?: Decision[];
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
    const { ok, data } = await apiFetch<{ request: Req; error?: { message: string } }>(
      `/api/requests/${requestId}`
    );
    setLoading(false);

    if (!ok) {
      setError(data?.error?.message ?? "Failed to load request.");
      return;
    }
    setReq(data?.request ?? null);
  }

  useEffect(() => {
    if (!initial) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDraft = req?.status === "DRAFT";

  const typeFields = useMemo(() => (req ? TYPE_FIELDS[req.type] ?? [] : []), [req]);

  const missing = useMemo(() => {
    if (!req) return [];
    const m: string[] = [];
    if (!req.title || req.title.trim().length < 3) m.push("title");
    if (req.amount == null || req.amount <= 0) m.push("amount");
    if (!req.reason || req.reason.trim().length < 10) m.push("reason");

    for (const f of typeFields) {
      if (f === "billingCycle") {
        if (req.billingCycle !== "MONTHLY" && req.billingCycle !== "YEARLY") m.push("billingCycle");
      } else if (isBlank((req as Record<string, unknown>)[f])) {
        m.push(f);
      }
    }
    return m;
  }, [req, typeFields]);

  function updateField<K extends keyof Req>(key: K, value: Req[K]) {
    if (!req) return;
    setReq({ ...req, [key]: value });
  }

  async function save(): Promise<boolean> {
    if (!req) return false;
    setSaving(true);
    setError(null);
    setNotice(null);

    const { ok, data } = await apiFetch<{ request: Partial<Req>; error?: { message: string } }>(
      `/api/requests/${requestId}`,
      {
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
          expenseDate: req.expenseDate ?? undefined,
        }),
      }
    );
    setSaving(false);

    if (!ok) {
      setError(data?.error?.message ?? "Failed to save.");
      return false;
    }

    setNotice("Saved.");
    setReq((prev) => (prev ? { ...prev, ...data?.request } : prev));
    router.refresh();
    return true;
  }

  async function submit() {
    if (!req) return;
    setSubmitting(true);

    // The submit endpoint validates what is stored in the DB, not what is in
    // the form, so persist the current edits first.
    if (!(await save())) {
      setSubmitting(false);
      return;
    }
    setError(null);
    setNotice(null);

    const { ok, data } = await apiFetch<{ error?: { message: string } }>(`/api/requests/${requestId}/submit`, {
      method: "POST",
    });

    setSubmitting(false);

    if (!ok) {
      setError(data?.error?.message ?? "Failed to submit.");
      return;
    }

    setNotice("Submitted.");
    await load();
    router.refresh();
  }

  if (loading) return <Card><LoadingState /></Card>;
  if (error && !req) return <Card><ErrorState message={error} /></Card>;
  if (!req) return <Card><LoadingState label="Not found." /></Card>;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <div className="mb-1 text-xs font-medium text-muted">ID</div>
          <div className="text-sm font-semibold text-ink">{req.id}</div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-muted">Status</div>
          <StatusBadge status={req.status} />
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-muted">Type</div>
          <div className="text-sm font-semibold text-ink">{req.type}</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Title">
          <Input
            value={req.title ?? ""}
            onChange={(e) => updateField("title", e.target.value)}
            disabled={!isDraft}
            placeholder="e.g., New laptop for development"
          />
        </Field>

        <Field label="Amount (USD)">
          <Input
            type="number"
            value={req.amount ?? ""}
            onChange={(e) => updateField("amount", e.target.value === "" ? null : Number(e.target.value))}
            disabled={!isDraft}
            placeholder="e.g., 2400"
          />
        </Field>

        {typeFields.includes("vendor") ? (
          <Field label="Vendor">
            <Input
              value={req.vendor ?? ""}
              onChange={(e) => updateField("vendor", e.target.value)}
              disabled={!isDraft}
              placeholder="e.g., Apple"
            />
          </Field>
        ) : null}

        {typeFields.includes("costCenter") ? (
          <Field label="Cost Center">
            <Input
              value={req.costCenter ?? ""}
              onChange={(e) => updateField("costCenter", e.target.value)}
              disabled={!isDraft}
              placeholder="e.g., Engineering"
            />
          </Field>
        ) : null}

        {typeFields.includes("expenseDate") ? (
          <Field label="Expense Date">
            <Input
              type="date"
              value={req.expenseDate ?? ""}
              onChange={(e) => updateField("expenseDate", e.target.value)}
              disabled={!isDraft}
            />
          </Field>
        ) : null}

        {typeFields.includes("billingCycle") ? (
          <Field label="Billing Cycle">
            <Select
              value={req.billingCycle ?? ""}
              onChange={(e) => updateField("billingCycle", e.target.value)}
              disabled={!isDraft}
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </Select>
          </Field>
        ) : null}

        {typeFields.includes("invoiceNumber") ? (
          <Field label="Invoice Number">
            <Input
              value={req.invoiceNumber ?? ""}
              onChange={(e) => updateField("invoiceNumber", e.target.value)}
              disabled={!isDraft}
              placeholder="e.g., INV-2024-0091"
            />
          </Field>
        ) : null}

        <div className="sm:col-span-2">
          <Field label="Reason">
            <Textarea
              value={req.reason ?? ""}
              onChange={(e) => updateField("reason", e.target.value)}
              disabled={!isDraft}
              className="min-h-[110px]"
              placeholder="Why is this needed? What’s the business justification?"
            />
          </Field>
        </div>
      </div>

      {missing.length > 0 && isDraft ? (
        <div className="mt-4 text-xs text-muted">
          Missing required fields for submit: <b className="font-semibold text-ink">{missing.join(", ")}</b>
        </div>
      ) : null}

      {error ? <div className="mt-3 text-xs text-danger">{error}</div> : null}
      {notice ? <div className="mt-3 text-xs text-success">{notice}</div> : null}

      <div className="mt-5 flex flex-wrap justify-end gap-2.5">
        <Button onClick={load}>Reload</Button>

        <Button onClick={save} disabled={!isDraft || saving}>
          {saving ? "Saving..." : "Save draft"}
        </Button>

        <Button
          variant="primary"
          onClick={submit}
          disabled={!isDraft || submitting || missing.length > 0}
          title={missing.length > 0 ? "Fill required fields before submit" : "Submit for approval"}
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </Card>
  );
}
