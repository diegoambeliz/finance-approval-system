"use client";

export default function DecisionsTimeline({ initial }: { initial: any[] }) {
  const decisions = initial ?? [];

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>Audit Trail</div>

      {decisions.length === 0 ? (
        <div style={{ opacity: 0.75 }}>No decisions yet.</div>
      ) : (
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {decisions.map((d: any) => (
            <li key={d.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 800 }}>
                {d.step} — {d.action}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {new Date(d.createdAt).toLocaleString()} · by {String(d.decidedById).slice(0, 8)}…
              </div>
              {d.reason ? <div style={{ marginTop: 4 }}>{d.reason}</div> : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
