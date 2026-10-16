import { getNavFlags } from "@/server/auth";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { canReview, isAdmin } = await getNavFlags();

  return (
    <AppShell canReview={canReview} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
