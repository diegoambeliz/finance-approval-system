"use client";

import ErrorFallback from "@/app/ErrorFallback";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorFallback {...props} />;
}
