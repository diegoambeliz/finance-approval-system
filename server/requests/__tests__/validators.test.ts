import { describe, expect, it } from "vitest";
import { CreateDraftSchema, DecisionSchema, UpdateDraftSchema } from "../validators";

describe("CreateDraftSchema", () => {
  it("accepts each known request type", () => {
    for (const type of ["PURCHASE", "REIMBURSEMENT", "SUBSCRIPTION", "INVOICE_PAYMENT"]) {
      expect(CreateDraftSchema.safeParse({ type }).success).toBe(true);
    }
  });

  it("rejects an unknown type", () => {
    expect(CreateDraftSchema.safeParse({ type: "GIFT_CARD" }).success).toBe(false);
  });

  it("rejects a missing type", () => {
    expect(CreateDraftSchema.safeParse({}).success).toBe(false);
  });
});

describe("UpdateDraftSchema", () => {
  it("accepts an empty object (every field optional)", () => {
    expect(UpdateDraftSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a fully populated valid draft", () => {
    const result = UpdateDraftSchema.safeParse({
      title: "New laptop",
      amount: 1200,
      reason: "Replacement for a broken device.",
      vendor: "Apple",
      costCenter: "Engineering",
      expenseDate: "2026-09-30",
      billingCycle: "MONTHLY",
      invoiceNumber: "INV-0001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a title shorter than 3 characters", () => {
    expect(UpdateDraftSchema.safeParse({ title: "ab" }).success).toBe(false);
  });

  it("rejects a title longer than 140 characters", () => {
    expect(UpdateDraftSchema.safeParse({ title: "a".repeat(141) }).success).toBe(false);
  });

  it("rejects a zero or negative amount", () => {
    expect(UpdateDraftSchema.safeParse({ amount: 0 }).success).toBe(false);
    expect(UpdateDraftSchema.safeParse({ amount: -50 }).success).toBe(false);
  });

  it("accepts a positive amount", () => {
    expect(UpdateDraftSchema.safeParse({ amount: 0.01 }).success).toBe(true);
  });

  it("rejects an empty reason", () => {
    expect(UpdateDraftSchema.safeParse({ reason: "" }).success).toBe(false);
  });

  it("rejects an expenseDate shorter than YYYY-MM-DD", () => {
    expect(UpdateDraftSchema.safeParse({ expenseDate: "2026-1-1" }).success).toBe(false);
  });

  it("rejects an invalid billingCycle", () => {
    expect(UpdateDraftSchema.safeParse({ billingCycle: "WEEKLY" }).success).toBe(false);
  });

  it("accepts both valid billingCycle values", () => {
    expect(UpdateDraftSchema.safeParse({ billingCycle: "MONTHLY" }).success).toBe(true);
    expect(UpdateDraftSchema.safeParse({ billingCycle: "YEARLY" }).success).toBe(true);
  });
});

describe("DecisionSchema", () => {
  it("accepts APPROVE without a reason", () => {
    expect(DecisionSchema.safeParse({ action: "APPROVE" }).success).toBe(true);
  });

  it("accepts REJECT with a reason", () => {
    const result = DecisionSchema.safeParse({
      action: "REJECT",
      reason: "Cost center does not have sufficient budget.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown action", () => {
    expect(DecisionSchema.safeParse({ action: "MAYBE" }).success).toBe(false);
  });

  it("rejects a missing action", () => {
    expect(DecisionSchema.safeParse({ reason: "No reason given" }).success).toBe(false);
  });

  it("rejects a reason longer than 500 characters", () => {
    const result = DecisionSchema.safeParse({ action: "REJECT", reason: "a".repeat(501) });
    expect(result.success).toBe(false);
  });
});
