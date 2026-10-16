import { Card } from "@/components/ui/Card";

export type Decision = {
  id: string;
  step: "MANAGER" | "FINANCE";
  action: string;
  reason: string | null;
  decidedById: string;
  decidedBy: { name: string } | null;
  createdAt: string;
};

function describe(d: Decision): string {
  const who = d.decidedBy?.name ?? "Someone";
  const step = d.step === "MANAGER" ? "manager" : "finance";
  const verb = d.action === "APPROVE" ? "approved" : "rejected";
  return `${who} ${verb} the ${step} review`;
}

export default function DecisionsTimeline({ initial }: { initial: Decision[] }) {
  const decisions = initial ?? [];

  return (
    <Card className="p-5">
      <div className="mb-3 text-sm font-semibold text-ink">Approval History</div>

      {decisions.length === 0 ? (
        <div className="text-sm text-muted">No decisions yet.</div>
      ) : (
        <ol className="m-0 list-none space-y-3 p-0">
          {decisions.map((d) => (
            <li key={d.id}>
              <div className="text-sm font-semibold text-ink">{describe(d)}</div>
              <div className="text-xs text-muted">{new Date(d.createdAt).toLocaleString()}</div>
              {d.reason ? <div className="mt-1 text-sm text-ink">{d.reason}</div> : null}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
