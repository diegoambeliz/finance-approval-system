import { DecisionAction, FinanceRequest } from "./types";

/**
 * These functions are pure and throw ONLY when the transition is impossible.
 */

export function submitRequest(req: FinanceRequest): FinanceRequest {
  if (req.status !== "DRAFT") {
    throw new Error("INVALID_TRANSITION_SUBMIT");
  }
  return { ...req, status: "WAITING_FOR_MANAGER" };
}

export function applyManagerDecision(params: {
  req: FinanceRequest;
  action: DecisionAction;
}): FinanceRequest {
  const { req, action } = params;

  if (req.status !== "WAITING_FOR_MANAGER") {
    throw new Error("INVALID_TRANSITION_MANAGER_DECISION");
  }

  if (action === "APPROVE") {
    return { ...req, status: "WAITING_FOR_FINANCE" };
  }

  // REJECT
  return { ...req, status: "REJECTED" };
}

export function applyFinanceDecision(params: {
  req: FinanceRequest;
  action: DecisionAction;
}): FinanceRequest {
  const { req, action } = params;

  if (req.status !== "WAITING_FOR_FINANCE") {
    throw new Error("INVALID_TRANSITION_FINANCE_DECISION");
  }

  if (action === "APPROVE") {
    return { ...req, status: "APPROVED" };
  }

  // REJECT
  return { ...req, status: "REJECTED" };
}
