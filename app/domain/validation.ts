import { BillingCycle, FinanceRequest, FieldError, SimpleResult } from "./types";

const MIN_TITLE_LEN = 3;
const MIN_REASON_LEN = 10;

function isBlank(v: unknown): boolean {
  return typeof v !== "string" || v.trim().length === 0;
}

function add(errors: FieldError[], field: string, message: string) {
  errors.push({ field, message });
}

function isValidBillingCycle(v: unknown): v is BillingCycle {
  return v === "MONTHLY" || v === "YEARLY";
}

export function validateForSubmit(req: FinanceRequest): SimpleResult {
  const errors: FieldError[] = [];

  // Global requirements
  if (isBlank(req.type)) add(errors, "type", "Type is required.");
  if (isBlank(req.title) || req.title.trim().length < MIN_TITLE_LEN) {
    add(errors, "title", `Title must be at least ${MIN_TITLE_LEN} characters.`);
  }
  if (typeof req.amount !== "number" || Number.isNaN(req.amount) || req.amount <= 0) {
    add(errors, "amount", "Amount must be greater than 0.");
  }
  if (isBlank(req.reason) || req.reason.trim().length < MIN_REASON_LEN) {
    add(errors, "reason", `Reason must be at least ${MIN_REASON_LEN} characters.`);
  }

  // Type-specific requirements
  switch (req.type) {
    case "PURCHASE": {
      if (isBlank(req.vendor)) add(errors, "vendor", "Vendor is required for purchases.");
      if (isBlank(req.costCenter)) add(errors, "costCenter", "Cost center is required for purchases.");
      break;
    }
    case "REIMBURSEMENT": {
      if (isBlank(req.expenseDate)) add(errors, "expenseDate", "Expense date is required for reimbursements.");
      break;
    }
    case "SUBSCRIPTION": {
      if (isBlank(req.vendor)) add(errors, "vendor", "Vendor is required for subscriptions.");
      if (!isValidBillingCycle(req.billingCycle)) {
        add(errors, "billingCycle", "Billing cycle must be MONTHLY or YEARLY.");
      }
      break;
    }
    case "INVOICE_PAYMENT": {
      if (isBlank(req.vendor)) add(errors, "vendor", "Vendor is required for invoice payments.");
      if (isBlank(req.invoiceNumber)) add(errors, "invoiceNumber", "Invoice number is required for invoice payments.");
      break;
    }
    default: {
      // If type somehow invalid at runtime
      add(errors, "type", "Invalid request type.");
      break;
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true };
}
