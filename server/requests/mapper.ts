import type { FinanceRequest as DbRequest } from "@prisma/client";
import type { FinanceRequest as DomainRequest } from "@/domain/types";

export function dbToDomainRequest(r: DbRequest): DomainRequest {
  return {
    id: r.id,
    createdById: r.createdById,
    status: r.status,
    type: r.type,

    title: r.title ?? undefined,
    amount: r.amount ?? undefined,
    reason: r.reason ?? undefined,

    vendor: r.vendor ?? undefined,
    costCenter: r.costCenter ?? undefined,
    expenseDate: r.expenseDate ? r.expenseDate.toISOString().slice(0, 10) : undefined,
    billingCycle: r.billingCycle ?? undefined,
    invoiceNumber: r.invoiceNumber ?? undefined,
  };
}
