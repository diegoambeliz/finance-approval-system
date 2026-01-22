import { describe, expect, it } from "vitest";
import { canCreateRequest, canEditDraft, canFinanceDecide, canManagerDecide, canSubmit, canViewRequest } from "../rules";
import { FinanceRequest, User } from "../types";

const requester: User = { id: "u1", roles: ["REQUESTER"] };
const otherRequester: User = { id: "u2", roles: ["REQUESTER"] };
const manager: User = { id: "m1", roles: ["MANAGER"] };
const finance: User = { id: "f1", roles: ["FINANCE"] };
const admin: User = { id: "a1", roles: ["ADMIN"] };
const adminManager: User = { id: "am1", roles: ["ADMIN", "MANAGER"] };

function req(overrides: Partial<FinanceRequest> = {}): FinanceRequest {
  return {
    id: "r1",
    createdById: "u1",
    status: "DRAFT",
    type: "PURCHASE",
    title: "New laptop",
    amount: 1200,
    reason: "Need a replacement laptop for work productivity and reliability.",
    vendor: "Apple",
    costCenter: "Engineering",
    ...overrides,
  };
}

describe("rules", () => {
  it("requester can create requests", () => {
    expect(canCreateRequest(requester)).toBe(true);
    expect(canCreateRequest(manager)).toBe(false);
    expect(canCreateRequest(admin)).toBe(false);
  });

  it("requester can edit only own DRAFT", () => {
    expect(canEditDraft(requester, req({ status: "DRAFT" }))).toBe(true);
    expect(canEditDraft(otherRequester, req({ status: "DRAFT" }))).toBe(false);
    expect(canEditDraft(requester, req({ status: "WAITING_FOR_MANAGER" }))).toBe(false);
  });

  it("admin cannot edit requests (only manage roles)", () => {
    expect(canEditDraft(admin, req({ status: "DRAFT" }))).toBe(false);
  });

  it("submit allowed only for owner draft and valid data", () => {
    const r = canSubmit(requester, req({ status: "DRAFT" }));
    expect(r.ok).toBe(true);

    const r2 = canSubmit(otherRequester, req({ status: "DRAFT" }));
    expect(r2.ok).toBe(false);

    const r3 = canSubmit(requester, req({ status: "WAITING_FOR_MANAGER" }));
    expect(r3.ok).toBe(false);

    const r4 = canSubmit(requester, req({ amount: 0 }));
    expect(r4.ok).toBe(false);
  });

  it("manager can decide only on WAITING_FOR_MANAGER", () => {
    expect(canManagerDecide(manager, req({ status: "WAITING_FOR_MANAGER" }))).toBe(true);
    expect(canManagerDecide(manager, req({ status: "DRAFT" }))).toBe(false);
    expect(canManagerDecide(finance, req({ status: "WAITING_FOR_MANAGER" }))).toBe(false);
    expect(canManagerDecide(adminManager, req({ status: "WAITING_FOR_MANAGER" }))).toBe(true);
  });

  it("finance can decide only on WAITING_FOR_FINANCE", () => {
    expect(canFinanceDecide(finance, req({ status: "WAITING_FOR_FINANCE" }))).toBe(true);
    expect(canFinanceDecide(finance, req({ status: "WAITING_FOR_MANAGER" }))).toBe(false);
    expect(canFinanceDecide(manager, req({ status: "WAITING_FOR_FINANCE" }))).toBe(false);
  });

  it("requester can view only own; manager/finance/admin can view all", () => {
    expect(canViewRequest(requester, req({ createdById: "u1" }))).toBe(true);
    expect(canViewRequest(requester, req({ createdById: "u2" }))).toBe(false);

    expect(canViewRequest(manager, req({ createdById: "u2" }))).toBe(true);
    expect(canViewRequest(finance, req({ createdById: "u2" }))).toBe(true);
    expect(canViewRequest(admin, req({ createdById: "u2" }))).toBe(true);
  });
});
