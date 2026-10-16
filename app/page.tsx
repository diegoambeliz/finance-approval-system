import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { LinkButton } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-10 text-center shadow-card">
        <div className="mb-2 text-lg font-bold text-ink">Approvals</div>
        <p className="mb-8 text-sm text-muted">
          Submit finance requests and track Manager and Finance approvals in one place.
        </p>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="inline-flex w-full items-center justify-center rounded-control bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <LinkButton href="/app" variant="primary" className="w-full">
            Go to Dashboard
          </LinkButton>
        </SignedIn>
      </div>
    </div>
  );
}
