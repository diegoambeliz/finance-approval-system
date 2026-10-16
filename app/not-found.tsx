import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-10 text-center shadow-card">
        <h1 className="mb-2 text-[26px] font-bold text-ink">Page not found</h1>
        <p className="mb-8 text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist, or may have been moved.
        </p>
        <LinkButton href="/app" variant="primary" className="w-full">
          Go to Approvals
        </LinkButton>
      </div>
    </main>
  );
}
