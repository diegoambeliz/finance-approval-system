import NewRequestButton from "./NewRequestButton";
import RequestsTable from "./RequestsTable";

async function getRequests() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/requests`, {
    // On Vercel, NEXT_PUBLIC_APP_URL should be set. In local, fetch relative from client;
    // so for server fetch, we’ll use the built-in Request Headers trick in next step if needed.
    cache: "no-store",
  }).catch(() => null);

  // If server fetch fails (common locally), we’ll let client load instead.
  if (!res || !res.ok) return null;

  return res.json() as Promise<{ requests: any[] }>;
}

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const data = await getRequests();

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>My Requests</h1>
          <p style={{ opacity: 0.8 }}>Create drafts, fill details, then submit for approvals.</p>
        </div>
        <NewRequestButton />
      </div>

      <div style={{ marginTop: 18 }}>
        <RequestsTable initial={data?.requests ?? null} />
      </div>
    </main>
  );
}
