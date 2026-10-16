import { cookies } from "next/headers";
import { getDbUserOrThrow } from "@/server/auth";
import InboxTables from "./InboxTables";
import type { Queues } from "./InboxTables";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

async function getInbox() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/requests/inbox`, {
    // Forward the user's cookies so Clerk sees this server fetch as signed in.
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  }).catch(() => null);

  // If server fetch fails, we'll let client load instead.
  if (!res || !res.ok) return null;

  return res.json().catch(() => null) as Promise<{ queues: Queues } | null>;
}

export default async function InboxPage() {
  const me = await getDbUserOrThrow();
  const isManager = me.roles.includes("MANAGER");
  const isFinance = me.roles.includes("FINANCE");

  if (!isManager && !isFinance) {
    return (
      <main>
        <PageHeader title="Approval Inbox" subtitle="You don't have permission to review requests." />
      </main>
    );
  }

  const data = await getInbox();

  return (
    <main>
      <PageHeader title="Approval Inbox" subtitle="Requests waiting for your review." />

      <InboxTables initial={data?.queues ?? null} isManager={isManager} isFinance={isFinance} />
    </main>
  );
}
