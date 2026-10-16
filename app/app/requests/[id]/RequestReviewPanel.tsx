"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TYPE_FIELDS, FIELD_LABELS } from "../typeFields";
import { apiFetch } from "@/lib/apiFetch";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReadField, Textarea } from "@/components/ui/Field";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/Badge";

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

  async function decide(action: "APPROVE" | "REJECT", reason?: string) {
    setDeciding(true);
    setError(null);
    setNotice(null);

    const { ok, data } = await apiFetch<{ error?: { message: string } }>(
      `/api/requests/${requestId}/decision`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      }
    );
    setDeciding(false);

    if (!ok) {
      setError(data?.error?.message ?? "Failed to submit decision.");
      return;
    }

    setNotice(action === "APPROVE" ? "Request approved." : "Request rejected.");
    setShowReject(false);
    setRejectReason("");
    await load();
    router.refresh();
  }

  if (loading) return <Card><LoadingState /></Card>;
  if (error && !req) return <Card><ErrorState message={error} /></Card>;
  if (!req) return <Card><LoadingState label="Not found." /></Card>;

  const canDecide =
    (isManager && req.status === "WAITING_FOR_MANAGER") || (isFinance && req.status === "WAITING_FOR_FINANCE");
  const relevantFields = TYPE_FIELDS[req.type] ?? [];

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
        <ReadField label="Title" value={req.title} />
        <ReadField label="Amount" value={req.amount == null ? null : `$${req.amount}`} />

        {relevantFields.map((f) => (
          <ReadField key={f} label={FIELD_LABELS[f]} value={((req as Record<string, unknown>)[f] as string | null | undefined) ?? null} />
        ))}

        <div className="sm:col-span-2">
          <ReadField label="Reason" value={req.reason} multiline />
        </div>
      </div>

      {error ? <div className="mt-3 text-xs text-danger">{error}</div> : null}
      {notice ? <div className="mt-3 text-xs text-success">{notice}</div> : null}

      {canDecide ? (
        showReject ? (
          <div className="mt-5 rounded-control border border-border p-4">
            <div className="mb-2 text-sm font-semibold text-ink">Reject request</div>

            <label htmlFor="reject-reason" className="mb-1.5 block text-xs font-medium text-muted">
              Reason
            </label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[80px]"
              placeholder="e.g., Cost center does not have sufficient budget."
              maxLength={500}
            />

            <div className="mt-3 flex justify-end gap-2.5">
              <Button onClick={() => setShowReject(false)} disabled={deciding}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => decide("REJECT", rejectReason.trim())}
                disabled={deciding || rejectReason.trim().length === 0}
              >
                {deciding ? "Rejecting..." : "Reject Request"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex justify-end gap-2.5">
            <Button variant="danger" onClick={() => setShowReject(true)} disabled={deciding}>
              Reject
            </Button>
            <Button variant="primary" onClick={() => decide("APPROVE")} disabled={deciding}>
              {deciding ? "Approving..." : "Approve"}
            </Button>
          </div>
        )
      ) : null}
    </Card>
  );
}
