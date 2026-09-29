"use client";

import { useEffect } from "react";

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
    <main style={{ maxWidth: 640, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        We couldn&apos;t load this page. Please try again.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #111",
          background: "#111",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </main>
  );
}
