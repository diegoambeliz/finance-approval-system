import { cookies } from "next/headers";
import RequestEditor from "./RequestEditor";
import RequestReviewPanel from "./RequestReviewPanel";
import DecisionsTimeline from "./DecisionsTimeline";
import { getDbUserOrThrow } from "@/server/auth";
import { PageHeader } from "@/components/ui/PageHeader";

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
  const [data, me] = await Promise.all([getRequest(id), getDbUserOrThrow()]);

  // If server fetch fails locally, the editor/review panel will client-load.
  const initial = data?.request ?? null;

  const isOwner = initial ? initial.createdById === me.id : false;
  const isManager = me.roles.includes("MANAGER");
  const isFinance = me.roles.includes("FINANCE");
  const isDraftOwner = isOwner && initial?.status === "DRAFT";

  return (
    <main>
      <PageHeader
        title="Request"
        subtitle={isDraftOwner ? "Edit your draft, then submit for approval." : "Review request details."}
      />

      {isDraftOwner ? (
        <RequestEditor requestId={id} initial={initial} />
      ) : (
        <RequestReviewPanel requestId={id} initial={initial} isManager={isManager} isFinance={isFinance} />
      )}

      <div className="mt-4">
        <DecisionsTimeline initial={initial?.decisions ?? []} />
      </div>
    </main>
  );
}
