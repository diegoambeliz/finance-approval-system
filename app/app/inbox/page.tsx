import { cookies } from "next/headers";
import { getDbUserOrThrow } from "@/server/auth";
import InboxTables from "./InboxTables";

export const dynamic = "force-dynamic";

async function getInbox() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/requests/inbox`, {
    // Forward the user's cookies so Clerk sees this server fetch as signed in.
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  }).catch(() => null);

  // If server fetch fails, we'll let client load instead.
  if (!res || !res.ok) return null;

  return res.json().catch(() => null) as Promise<{ queues: { manager: any[] | null; finance: any[] | null } } | null>;
}

export default async function InboxPage() {
  const me = await getDbUserOrThrow();
  const isManager = me.roles.includes("MANAGER");
  const isFinance = me.roles.includes("FINANCE");

  if (!isManager && !isFinance) {
    return (
      <main>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Approval Inbox</h1>
        <p style={{ opacity: 0.8 }}>You don&apos;t have permission to review requests.</p>
      </main>
    );
  }

  const data = await getInbox();

  return (
    <main>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Approval Inbox</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>Requests waiting for your review.</p>

      <InboxTables initial={data?.queues ?? null} isManager={isManager} isFinance={isFinance} />
    </main>
  );
}
