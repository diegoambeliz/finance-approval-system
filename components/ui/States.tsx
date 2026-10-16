export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <div className="px-5 py-6 text-sm text-muted">{label}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="px-5 py-6 text-sm text-danger">{message}</div>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-5 py-8 text-center">
      <div className="text-sm text-ink">{title}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
