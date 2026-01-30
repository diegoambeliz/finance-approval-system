import Link from "next/link";

export default function AppHome() {
  return (
    <main>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Create and submit finance requests. Track approvals from Manager and Finance.
      </p>

      <Link
        href="/app/requests"
        style={{
          display: "inline-block",
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ddd",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        Go to My Requests →
      </Link>
    </main>
  );
}
