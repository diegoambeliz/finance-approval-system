import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
        </nav>
        <UserButton />
      </header>

      {children}
    </div>
  );
}
