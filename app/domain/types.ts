export type Role = "REQUESTER" | "MANAGER" | "FINANCE" | "ADMIN";

export type RequestStatus =
  | "DRAFT"
  | "WAITING_FOR_MANAGER"
  | "WAITING_FOR_FINANCE"
  | "APPROVED"
  | "REJECTED";

export type RequestType =
  | "PURCHASE"
  | "REIMBURSEMENT"
  | "SUBSCRIPTION"
  | "INVOICE_PAYMENT";

export type BillingCycle = "MONTHLY" | "YEARLY";

export type DecisionStep = "MANAGER" | "FINANCE";
export type DecisionAction = "APPROVE" | "REJECT";

export type User = {
  id: string;
  roles: Role[];
};

export type FinanceRequest = {
  id: string;
  createdById: string;

  status: RequestStatus;
  type: RequestType;

  title: string;
  amount: number;
  reason: string;

  // type-specific fields
  vendor?: string; // PURCHASE, SUBSCRIPTION, INVOICE_PAYMENT
  costCenter?: string; // PURCHASE
  expenseDate?: string; // REIMBURSEMENT (ISO date string)
  billingCycle?: BillingCycle; // SUBSCRIPTION
  invoiceNumber?: string; // INVOICE_PAYMENT
};

export type FieldError = {
  field: string;
  message: string;
};

export type Result<T> = { ok: true; value: T } | { ok: false; errors: FieldError[] };

export type SimpleResult = { ok: true } | { ok: false; errors: FieldError[] };
