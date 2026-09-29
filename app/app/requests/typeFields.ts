// Mirrors the type-specific field requirements in domain/validation.ts.
export const TYPE_FIELDS: Record<string, string[]> = {
  PURCHASE: ["vendor", "costCenter"],
  REIMBURSEMENT: ["expenseDate"],
  SUBSCRIPTION: ["vendor", "billingCycle"],
  INVOICE_PAYMENT: ["vendor", "invoiceNumber"],
};

export const FIELD_LABELS: Record<string, string> = {
  vendor: "Vendor",
  costCenter: "Cost Center",
  expenseDate: "Expense Date",
  billingCycle: "Billing Cycle",
  invoiceNumber: "Invoice Number",
};
