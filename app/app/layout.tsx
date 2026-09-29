import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getDbUserOrThrow } from "@/server/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await getDbUserOrThrow().catch(() => null);
  const canReview = !!me && (me.roles.includes("MANAGER") || me.roles.includes("FINANCE"));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/app" style={{ fontWeight: 800, textDecoration: "none" }}>
            Approvals
          </Link>
          <Link href="/app/requests" style={{ textDecoration: "none" }}>
            My Requests
          </Link>
          {canReview ? (
            <Link href="/app/inbox" style={{ textDecoration: "none" }}>
              Approval Inbox
            </Link>
          ) : null}
        </nav>
        <UserButton />
      </header>

      {children}
    </div>
  );
}
