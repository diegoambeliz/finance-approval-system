import { cookies } from "next/headers";
import NewRequestButton from "./NewRequestButton";
import RequestsTable from "./RequestsTable";

async function getRequests() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/requests`, {
    // Forward the user's cookies so Clerk sees this server fetch as signed in.
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  }).catch(() => null);

  // If server fetch fails, we'll let client load instead.
  if (!res || !res.ok) return null;

  return res.json().catch(() => null) as Promise<{ requests: any[] } | null>;
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
