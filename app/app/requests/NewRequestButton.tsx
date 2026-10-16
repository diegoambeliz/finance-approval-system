"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";

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

    const { ok, data } = await apiFetch<{ request?: { id: string }; error?: { message: string } }>(
      "/api/requests",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      }
    );

    setLoading(false);

    if (!ok) {
      setError(data?.error?.message ?? "Failed to create draft.");
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
    <div className="relative">
      <Button variant="primary" onClick={() => setOpen(true)}>
        + New Request
      </Button>

      {open ? (
        <div className="absolute right-0 top-[46px] z-10 w-80 rounded-card border border-border bg-card p-4 shadow-elevated">
          <div className="mb-2 text-sm font-semibold text-ink">Create draft</div>

          <label htmlFor="new-request-type" className="mb-1.5 block text-xs font-medium text-muted">
            Type
          </label>
          <Select
            id="new-request-type"
            value={type}
            onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>

          {error ? <div className="mt-2.5 text-xs text-danger">{error}</div> : null}

          <div className="mt-3 flex justify-end gap-2.5">
            <Button size="sm" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={createDraft} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
