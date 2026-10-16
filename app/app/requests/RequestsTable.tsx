"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/Badge";

export type Row = {
  id: string;
  status: string;
  type: string;
  title: string | null;
  amount: number | null;
  createdAt: string;
  updatedAt: string;
};

export default function RequestsTable({ initial }: { initial: Row[] | null }) {
  const [rows, setRows] = useState<Row[] | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { ok, data } = await apiFetch<{ requests: Row[]; error?: { message: string } }>("/api/requests", {
      method: "GET",
    });

    setLoading(false);

    if (!ok) {
      setError(data?.error?.message ?? "Failed to load requests.");
      return;
    }

    setRows(data?.requests ?? []);
  }

  useEffect(() => {
    if (!initial) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader
        title="Requests"
        action={
          <Button size="sm" onClick={load}>
            Refresh
          </Button>
        }
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        <Table minWidth={860}>
          <Thead>
            <Th>ID</Th>
            <Th>Status</Th>
            <Th>Type</Th>
            <Th>Title</Th>
            <Th>Amount</Th>
            <Th>Updated</Th>
          </Thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <Tr key={r.id}>
                <Td>
                  <Link href={`/app/requests/${r.id}`} className="font-semibold text-ink hover:text-accent">
                    {r.id.slice(0, 8)}…
                  </Link>
                </Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
                <Td>{r.type}</Td>
                <Td>{r.title ?? <span className="text-muted">(empty)</span>}</Td>
                <Td>{r.amount == null ? <span className="text-muted">(empty)</span> : `$${r.amount}`}</Td>
                <Td>{new Date(r.updatedAt).toLocaleString()}</Td>
              </Tr>
            ))}

            {(rows ?? []).length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No requests yet." hint="Create a new draft to get started." />
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      ) : null}
    </Card>
  );
}
