"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";

export type Row = {
  id: string;
  status: string;
  type: string;
  title: string | null;
  amount: number | null;
  createdAt: string;
};

export type Queues = { manager: Row[] | null; finance: Row[] | null };

export default function InboxTables({
  initial,
  isManager,
  isFinance,
}: {
  initial: Queues | null;
  isManager: boolean;
  isFinance: boolean;
}) {
  const [queues, setQueues] = useState<Queues | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { ok, data } = await apiFetch<{ queues: Queues; error?: { message: string } }>(
      "/api/requests/inbox",
      { method: "GET" }
    );

    setLoading(false);

    if (!ok) {
      setError(data?.error?.message ?? "Failed to load inbox.");
      return;
    }

    setQueues(data?.queues ?? null);
  }

  useEffect(() => {
    if (!initial) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Card><LoadingState /></Card>;
  if (error) return <Card><ErrorState message={error} /></Card>;

  return (
    <div className="flex flex-col gap-5">
      {isManager ? (
        <Queue title="Waiting for Manager Review" rows={queues?.manager ?? []} onRefresh={load} />
      ) : null}

      {isFinance ? (
        <Queue title="Waiting for Finance Review" rows={queues?.finance ?? []} onRefresh={load} />
      ) : null}
    </div>
  );
}

function Queue({ title, rows, onRefresh }: { title: string; rows: Row[]; onRefresh: () => void }) {
  return (
    <Card>
      <CardHeader
        title={title}
        action={
          <Button size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="No requests waiting for your review." hint="You're all caught up." />
      ) : (
        <Table minWidth={720}>
          <Thead>
            <Th>Request</Th>
            <Th>Type</Th>
            <Th>Amount</Th>
            <Th align="right"></Th>
          </Thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r.id}>
                <Td>{r.title ?? <span className="text-muted">(untitled)</span>}</Td>
                <Td>{r.type}</Td>
                <Td>{r.amount == null ? <span className="text-muted">(empty)</span> : `$${r.amount}`}</Td>
                <Td align="right">
                  <LinkButton href={`/app/requests/${r.id}`} variant="primary" size="sm">
                    Review
                  </LinkButton>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
