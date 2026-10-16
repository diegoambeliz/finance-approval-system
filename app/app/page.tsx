import Link from "next/link";
import { cookies } from "next/headers";
import { getDbUserOrThrow } from "@/server/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/Badge";
import NewRequestButton from "./requests/NewRequestButton";

type Row = {
  id: string;
  status: string;
  type: string;
  title: string | null;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
};

async function getJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}${path}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return null;
  return res.json().catch(() => null) as Promise<T | null>;
}

export const dynamic = "force-dynamic";

const DONUT_SEGMENTS = [
  { key: "draft", label: "Draft", colorVar: "var(--color-neutral)" },
  { key: "inReview", label: "In review", colorVar: "var(--color-warning)" },
  { key: "approved", label: "Approved", colorVar: "var(--color-success)" },
  { key: "rejected", label: "Rejected", colorVar: "var(--color-danger)" },
] as const;

function StatusDonut({ counts }: { counts: Record<(typeof DONUT_SEGMENTS)[number]["key"], number> }) {
  const total = DONUT_SEGMENTS.reduce((sum, seg) => sum + counts[seg.key], 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
      <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--color-neutral-soft)" strokeWidth={16} />
      {total > 0
        ? DONUT_SEGMENTS.map((seg) => {
            const value = counts[seg.key];
            if (value === 0) return null;
            const dash = (value / total) * circumference;
            const circle = (
              <circle
                key={seg.key}
                cx={70}
                cy={70}
                r={radius}
                fill="none"
                stroke={seg.colorVar}
                strokeWidth={16}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return circle;
          })
        : null}
    </svg>
  );
}

export default async function AppHome() {
  const me = await getDbUserOrThrow();
  const canReview = me.roles.includes("MANAGER") || me.roles.includes("FINANCE");

  const [requestsData, inboxData] = await Promise.all([
    getJson<{ requests: Row[] }>("/api/requests"),
    canReview ? getJson<{ queues: { manager: Row[] | null; finance: Row[] | null } }>("/api/requests/inbox") : null,
  ]);

  const requests = requestsData?.requests ?? [];

  const counts = {
    draft: requests.filter((r) => r.status === "DRAFT").length,
    inReview: requests.filter((r) => r.status === "WAITING_FOR_MANAGER" || r.status === "WAITING_FOR_FINANCE").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  };

  const awaitingReview = (inboxData?.queues?.manager?.length ?? 0) + (inboxData?.queues?.finance?.length ?? 0);

  const recent = requests.slice(0, 5);

  return (
    <main>
      <PageHeader
        title="Dashboard"
        subtitle="Create and submit finance requests. Track approvals from Manager and Finance."
        action={<NewRequestButton />}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total requests" value={requests.length} tone="accent" />
        <StatCard label="Draft" value={counts.draft} tone="neutral" />
        <StatCard label="In review" value={counts.inReview} tone="warning" />
        {canReview ? (
          <StatCard label="Awaiting your review" value={awaitingReview} tone="danger" />
        ) : (
          <StatCard label="Approved" value={counts.approved} tone="success" />
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader title="Recent Requests" action={<Link href="/app/requests" className="text-sm font-medium text-accent hover:text-accent-hover">See all</Link>} />

          {recent.length === 0 ? (
            <EmptyState title="No requests yet." hint="Create a new draft to get started." />
          ) : (
            <Table minWidth={620}>
              <Thead>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </Thead>
              <tbody>
                {recent.map((r) => (
                  <Tr key={r.id}>
                    <Td>
                      <Link href={`/app/requests/${r.id}`} className="font-semibold text-ink hover:text-accent">
                        {r.title ?? "(empty)"}
                      </Link>
                    </Td>
                    <Td>{r.type}</Td>
                    <Td>{r.amount == null ? <span className="text-muted">(empty)</span> : `$${r.amount}`}</Td>
                    <Td>
                      <StatusBadge status={r.status} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 text-base font-semibold text-ink">Status Breakdown</div>
          <div className="flex flex-col items-center gap-5">
            <StatusDonut counts={counts} />
            <div className="w-full space-y-2">
              {DONUT_SEGMENTS.map((seg) => (
                <div key={seg.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <span className="h-2 w-2 rounded-full" style={{ background: seg.colorVar }} />
                    {seg.label}
                  </span>
                  <span className="font-medium text-muted">{counts[seg.key]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
