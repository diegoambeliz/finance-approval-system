import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ maxWidth: 640, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Page not found</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        The page you&apos;re looking for doesn&apos;t exist, or may have been moved.
      </p>
      <Link
        href="/app"
        style={{
          display: "inline-block",
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #111",
          background: "#111",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        Go to Approvals
      </Link>
    </main>
  );
}
