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

  it.each(["WAITING_FOR_MANAGER", "WAITING_FOR_FINANCE", "APPROVED", "REJECTED"] as const)(
    "submit throws when status is %s",
    (status) => {
      expect(() => submitRequest(req({ status }))).toThrow("INVALID_TRANSITION_SUBMIT");
    }
  );

  it("manager approve: WAITING_FOR_MANAGER -> WAITING_FOR_FINANCE", () => {
    const r = applyManagerDecision({ req: req({ status: "WAITING_FOR_MANAGER" }), action: "APPROVE" });
    expect(r.status).toBe("WAITING_FOR_FINANCE");
  });

  it("manager reject: WAITING_FOR_MANAGER -> REJECTED", () => {
    const r = applyManagerDecision({ req: req({ status: "WAITING_FOR_MANAGER" }), action: "REJECT" });
    expect(r.status).toBe("REJECTED");
  });

  it.each(["DRAFT", "WAITING_FOR_FINANCE", "APPROVED", "REJECTED"] as const)(
    "manager decision throws when status is %s",
    (status) => {
      expect(() => applyManagerDecision({ req: req({ status }), action: "APPROVE" })).toThrow(
        "INVALID_TRANSITION_MANAGER_DECISION"
      );
    }
  );

  it("finance approve: WAITING_FOR_FINANCE -> APPROVED", () => {
    const r = applyFinanceDecision({ req: req({ status: "WAITING_FOR_FINANCE" }), action: "APPROVE" });
    expect(r.status).toBe("APPROVED");
  });

  it("finance reject: WAITING_FOR_FINANCE -> REJECTED", () => {
    const r = applyFinanceDecision({ req: req({ status: "WAITING_FOR_FINANCE" }), action: "REJECT" });
    expect(r.status).toBe("REJECTED");
  });

  it.each(["DRAFT", "WAITING_FOR_MANAGER", "APPROVED", "REJECTED"] as const)(
    "finance decision throws when status is %s",
    (status) => {
      expect(() => applyFinanceDecision({ req: req({ status }), action: "APPROVE" })).toThrow(
        "INVALID_TRANSITION_FINANCE_DECISION"
      );
    }
  );
});
