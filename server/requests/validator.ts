import { z } from "zod";

export const RequestTypeSchema = z.enum([
  "PURCHASE",
  "REIMBURSEMENT",
  "SUBSCRIPTION",
  "INVOICE_PAYMENT",
]);

export const BillingCycleSchema = z.enum(["MONTHLY", "YEARLY"]);

export const CreateDraftSchema = z.object({
  type: RequestTypeSchema,
});

export const UpdateDraftSchema = z.object({
  title: z.string().min(3).max(140).optional(),
  amount: z.number().positive().optional(),
  reason: z.string().min(1).optional(),

  vendor: z.string().min(1).optional(),
  costCenter: z.string().min(1).optional(),
  expenseDate: z.string().min(10).optional(), // "YYYY-MM-DD"
  billingCycle: BillingCycleSchema.optional(),
  invoiceNumber: z.string().min(1).optional(),
});

export const DecisionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().max(500).optional(),
});
