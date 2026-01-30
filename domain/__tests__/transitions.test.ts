import { describe, expect, it } from "vitest";
import { applyFinanceDecision, applyManagerDecision, submitRequest } from "../transitions";
import { FinanceRequest } from "../types";

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

describe("transitions", () => {
  it("submit: DRAFT -> WAITING_FOR_MANAGER", () => {
    const r = submitRequest(req({ status: "DRAFT" }));
    expect(r.status).toBe("WAITING_FOR_MANAGER");
  });

  it("submit throws on invalid status", () => {
    expect(() => submitRequest(req({ status: "WAITING_FOR_MANAGER" }))).toThrow(
      "INVALID_TRANSITION_SUBMIT"
    );
  });

  it("manager approve: WAITING_FOR_MANAGER -> WAITING_FOR_FINANCE", () => {
    const r = applyManagerDecision({ req: req({ status: "WAITING_FOR_MANAGER" }), action: "APPROVE" });
    expect(r.status).toBe("WAITING_FOR_FINANCE");
  });

  it("manager reject: WAITING_FOR_MANAGER -> REJECTED", () => {
    const r = applyManagerDecision({ req: req({ status: "WAITING_FOR_MANAGER" }), action: "REJECT" });
    expect(r.status).toBe("REJECTED");
  });

  it("manager decision throws on invalid status", () => {
    expect(() =>
      applyManagerDecision({ req: req({ status: "DRAFT" }), action: "APPROVE" })
    ).toThrow("INVALID_TRANSITION_MANAGER_DECISION");
  });

  it("finance approve: WAITING_FOR_FINANCE -> APPROVED", () => {
    const r = applyFinanceDecision({ req: req({ status: "WAITING_FOR_FINANCE" }), action: "APPROVE" });
    expect(r.status).toBe("APPROVED");
  });

  it("finance reject: WAITING_FOR_FINANCE -> REJECTED", () => {
    const r = applyFinanceDecision({ req: req({ status: "WAITING_FOR_FINANCE" }), action: "REJECT" });
    expect(r.status).toBe("REJECTED");
  });

  it("finance decision throws on invalid status", () => {
    expect(() =>
      applyFinanceDecision({ req: req({ status: "WAITING_FOR_MANAGER" }), action: "APPROVE" })
    ).toThrow("INVALID_TRANSITION_FINANCE_DECISION");
  });
});
