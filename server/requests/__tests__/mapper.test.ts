import { describe, expect, it } from "vitest";
import { dbToDomainRequest } from "../mapper";
import type { FinanceRequest as DbRequest } from "@prisma/client";

function dbRequest(overrides: Partial<DbRequest> = {}): DbRequest {
  return {
    id: "r1",
    createdById: "u1",
    status: "DRAFT",
    type: "PURCHASE",
    title: null,
    amount: null,
    reason: null,
    vendor: null,
    costCenter: null,
    expenseDate: null,
    billingCycle: null,
    invoiceNumber: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("dbToDomainRequest", () => {
  it("maps a fresh DRAFT's null fields to undefined, not null", () => {
    const domain = dbToDomainRequest(dbRequest());

    expect(domain.title).toBeUndefined();
    expect(domain.amount).toBeUndefined();
    expect(domain.reason).toBeUndefined();
    expect(domain.vendor).toBeUndefined();
    expect(domain.costCenter).toBeUndefined();
    expect(domain.expenseDate).toBeUndefined();
    expect(domain.billingCycle).toBeUndefined();
    expect(domain.invoiceNumber).toBeUndefined();
  });

  it("passes populated values through unchanged", () => {
    const domain = dbToDomainRequest(
      dbRequest({
        title: "New laptop",
        amount: 1200,
        reason: "Replacement for a broken device.",
        vendor: "Apple",
        costCenter: "Engineering",
      })
    );

    expect(domain.title).toBe("New laptop");
    expect(domain.amount).toBe(1200);
    expect(domain.reason).toBe("Replacement for a broken device.");
    expect(domain.vendor).toBe("Apple");
    expect(domain.costCenter).toBe("Engineering");
  });

  it("formats expenseDate as an ISO date string", () => {
    const domain = dbToDomainRequest(dbRequest({ expenseDate: new Date("2026-09-30T00:00:00Z") }));
    expect(domain.expenseDate).toBe("2026-09-30");
  });
});
