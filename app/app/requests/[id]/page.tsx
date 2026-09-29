import { cookies } from "next/headers";
import RequestEditor from "./RequestEditor";
import DecisionsTimeline from "./DecisionsTimeline";

export const dynamic = "force-dynamic";

async function getRequest(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/requests/${id}`, {
    // Forward the user's cookies so Clerk sees this server fetch as signed in.
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getRequest(id);

  // If server fetch fails locally, RequestEditor will client-load.
  const initial = data?.request ?? null;

  return (
    <main>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Request</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>Edit your draft, then submit for approval.</p>

      <RequestEditor requestId={id} initial={initial} />

      <div style={{ marginTop: 18 }}>
        <DecisionsTimeline initial={initial?.decisions ?? []} />
      </div>
    </main>
  );
}
