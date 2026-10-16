"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled rendering error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-10 text-center shadow-card">
        <h1 className="mb-2 text-[26px] font-bold text-ink">Something went wrong</h1>
        <p className="mb-8 text-sm text-muted">We couldn&apos;t load this page. Please try again.</p>
        <Button variant="primary" className="w-full" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
