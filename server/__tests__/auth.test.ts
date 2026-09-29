import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));

const findUniqueMock = vi.fn();
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: findUniqueMock } } }));

const { getDbUserOrThrow } = await import("../auth");

describe("getDbUserOrThrow", () => {
  beforeEach(() => {
    authMock.mockReset();
    findUniqueMock.mockReset();
  });

  it("throws UNAUTHENTICATED when there is no Clerk session", async () => {
    authMock.mockResolvedValue({ userId: null });
    await expect(getDbUserOrThrow()).rejects.toMatchObject({ code: "UNAUTHENTICATED", status: 401 });
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("throws FORBIDDEN when the session has no matching DB user", async () => {
    authMock.mockResolvedValue({ userId: "user_1" });
    findUniqueMock.mockResolvedValue(null);
    await expect(getDbUserOrThrow()).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
  });

  it("throws FORBIDDEN for a deactivated user, even with a valid Clerk session", async () => {
    authMock.mockResolvedValue({ userId: "user_1" });
    findUniqueMock.mockResolvedValue({ id: "user_1", roles: ["REQUESTER"], isActive: false });
    await expect(getDbUserOrThrow()).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
  });

  it("returns the DB user when active", async () => {
    const user = { id: "user_1", roles: ["REQUESTER"], isActive: true };
    authMock.mockResolvedValue({ userId: "user_1" });
    findUniqueMock.mockResolvedValue(user);
    await expect(getDbUserOrThrow()).resolves.toEqual(user);
  });
});
