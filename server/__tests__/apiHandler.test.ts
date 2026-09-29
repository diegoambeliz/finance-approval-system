import { describe, expect, it, vi } from "vitest";
import { withApiErrors } from "../apiHandler";
import { forbidden, notFound, validationError } from "../errors";

describe("withApiErrors", () => {
  it("passes through a successful response unchanged", async () => {
    const handler = withApiErrors(async () => Response.json({ ok: true }));
    const res = await handler(new Request("http://test"), {});
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("converts a thrown ApiError into a structured JSON response", async () => {
    const handler = withApiErrors(async () => {
      throw notFound("This request doesn't exist.");
    });
    const res = await handler(new Request("http://test"), {});
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: { code: "NOT_FOUND", message: "This request doesn't exist." },
    });
  });

  it("includes details when the ApiError carries them", async () => {
    const handler = withApiErrors(async () => {
      throw validationError("Invalid request.", { fieldErrors: { title: ["too short"] } });
    });
    const res = await handler(new Request("http://test"), {});
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details).toEqual({ fieldErrors: { title: ["too short"] } });
  });

  it("maps forbidden() to a 403", async () => {
    const handler = withApiErrors(async () => {
      throw forbidden("Nope.");
    });
    const res = await handler(new Request("http://test"), {});
    expect(res.status).toBe(403);
  });

  it("converts an unexpected non-ApiError into a generic 500 without leaking details", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withApiErrors(async () => {
      throw new Error("relation \"FinanceRequest\" does not exist - internal Prisma detail");
    });
    const res = await handler(new Request("http://test"), {});
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).not.toContain("Prisma");
    expect(body.error.message).not.toContain("FinanceRequest");
    spy.mockRestore();
  });
});
