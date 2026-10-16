import { cookies } from "next/headers";
import NewRequestButton from "./NewRequestButton";
import RequestsTable from "./RequestsTable";
import type { Row } from "./RequestsTable";
import { PageHeader } from "@/components/ui/PageHeader";

async function getRequests() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/requests`, {
    // Forward the user's cookies so Clerk sees this server fetch as signed in.
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  }).catch(() => null);

  // If server fetch fails, we'll let client load instead.
  if (!res || !res.ok) return null;

  return res.json().catch(() => null) as Promise<{ requests: Row[] } | null>;
}

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const data = await getRequests();

  return (
    <main>
      <PageHeader
        title="My Requests"
        subtitle="Create drafts, fill details, then submit for approvals."
        action={<NewRequestButton />}
      />

      <RequestsTable initial={data?.requests ?? null} />
    </main>
  );
}
