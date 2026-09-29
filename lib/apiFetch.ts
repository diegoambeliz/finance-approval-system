// Client-side fetch wrapper used by every "use client" component that talks
// to our own API. A plain `await fetch(...)` throws on a real network
// failure (offline, DNS, timeout) - without a try/catch around it, callers
// were left with `loading`/`saving` stuck true forever, since the code never
// reached its own `finally`-style reset. This normalizes that into the same
// { ok, status, data } shape a caller gets for a normal non-2xx response, so
// there's exactly one failure path to handle instead of two.
export type ApiResult<T = unknown> = { ok: boolean; status: number; data: T | null };

export async function apiFetch<T = unknown>(input: string, init?: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: { message: "Network error. Please check your connection and try again." } } as T,
    };
  }

  const data = (await res.json().catch(() => null)) as T | null;
  return { ok: res.ok, status: res.status, data };
}
