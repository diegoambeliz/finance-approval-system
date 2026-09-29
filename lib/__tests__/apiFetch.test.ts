import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../apiFetch";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ok:true with the parsed body on a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ requests: [] }), { status: 200 }))
    );

    const result = await apiFetch<{ requests: unknown[] }>("/api/requests");
    expect(result).toEqual({ ok: true, status: 200, data: { requests: [] } });
  });

  it("returns ok:false with the server's error body on a non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Not found." } }), { status: 404 })
      )
    );

    const result = await apiFetch("/api/requests/missing");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ error: { code: "NOT_FOUND", message: "Not found." } });
  });

  it("normalizes a thrown network failure into a friendly error, never throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    const result = await apiFetch<{ error?: { message: string } }>("/api/requests");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
    expect(result.data?.error?.message).toMatch(/network/i);
  });
});
