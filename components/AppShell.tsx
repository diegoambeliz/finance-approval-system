import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { SidebarNav } from "./nav/SidebarNav";

export function AppShell({
  children,
  canReview,
  isAdmin,
}: {
  children: ReactNode;
  canReview: boolean;
  isAdmin: boolean;
}) {
  const items = [
    { href: "/app", label: "Dashboard" },
    { href: "/app/requests", label: "My Requests" },
    ...(canReview ? [{ href: "/app/inbox", label: "Approval Inbox" }] : []),
    ...(isAdmin ? [{ href: "/admin/users", label: "Users & Roles" }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-64 shrink-0 flex-col bg-ink px-4 py-6">
        <div className="mb-8 px-2 text-lg font-bold text-white">Approvals</div>
        <SidebarNav items={items} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-border bg-card px-8 py-4">
          <UserButton />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
