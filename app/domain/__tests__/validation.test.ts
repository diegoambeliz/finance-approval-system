import { describe, expect, it } from "vitest";
import { validateForSubmit } from "../validation";
import { FinanceRequest } from "../types";

function baseReq(overrides: Partial<FinanceRequest> = {}): FinanceRequest {
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

describe("validateForSubmit", () => {
  it("fails when amount <= 0", () => {
    const r = validateForSubmit(baseReq({ amount: 0 }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some(e => e.field === "amount")).toBe(true);
  });

  it("fails when reason too short", () => {
    const r = validateForSubmit(baseReq({ reason: "too short" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some(e => e.field === "reason")).toBe(true);
  });

  it("PURCHASE requires vendor and costCenter", () => {
    const r = validateForSubmit(baseReq({ vendor: "", costCenter: "" }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some(e => e.field === "vendor")).toBe(true);
      expect(r.errors.some(e => e.field === "costCenter")).toBe(true);
    }
  });

  it("REIMBURSEMENT requires expenseDate", () => {
    const r = validateForSubmit(
      baseReq({
        type: "REIMBURSEMENT",
        vendor: undefined,
        costCenter: undefined,
        expenseDate: "",
      })
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some(e => e.field === "expenseDate")).toBe(true);
  });

  it("SUBSCRIPTION requires vendor and billingCycle", () => {
    const r = validateForSubmit(
      baseReq({
        type: "SUBSCRIPTION",
        vendor: "",
        billingCycle: undefined,
        costCenter: undefined,
      })
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some(e => e.field === "vendor")).toBe(true);
      expect(r.errors.some(e => e.field === "billingCycle")).toBe(true);
    }
  });

  it("INVOICE_PAYMENT requires vendor and invoiceNumber", () => {
    const r = validateForSubmit(
      baseReq({
        type: "INVOICE_PAYMENT",
        vendor: "",
        invoiceNumber: "",
        costCenter: undefined,
      })
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some(e => e.field === "vendor")).toBe(true);
      expect(r.errors.some(e => e.field === "invoiceNumber")).toBe(true);
    }
  });

  it("passes for valid purchase", () => {
    const r = validateForSubmit(baseReq());
    expect(r.ok).toBe(true);
  });
});
