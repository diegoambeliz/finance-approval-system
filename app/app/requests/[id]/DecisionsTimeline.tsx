"use client";

function describe(d: any): string {
  const who = d.decidedBy?.name ?? "Someone";
  const step = d.step === "MANAGER" ? "manager" : "finance";
  const verb = d.action === "APPROVE" ? "approved" : "rejected";
  return `${who} ${verb} the ${step} review`;
}

export default function DecisionsTimeline({ initial }: { initial: any[] }) {
  const decisions = initial ?? [];

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>Approval History</div>

      {decisions.length === 0 ? (
        <div style={{ opacity: 0.75 }}>No decisions yet.</div>
      ) : (
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {decisions.map((d: any) => (
            <li key={d.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 800 }}>{describe(d)}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{new Date(d.createdAt).toLocaleString()}</div>
              {d.reason ? <div style={{ marginTop: 4 }}>{d.reason}</div> : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
