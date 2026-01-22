import { FinanceRequest, Role, SimpleResult, User } from "./types";
import { validateForSubmit } from "./validation";

function hasRole(user: User, role: Role): boolean {
  return user.roles.includes(role);
}

function isOwner(user: User, req: FinanceRequest): boolean {
  return user.id === req.createdById;
}

export function canViewRequest(user: User, req: FinanceRequest): boolean {
  // Requester can only view own requests
  if (hasRole(user, "REQUESTER") && !hasRole(user, "ADMIN") && !hasRole(user, "MANAGER") && !hasRole(user, "FINANCE")) {
    return isOwner(user, req);
  }

  // Anyone with MANAGER/FINANCE/ADMIN can view all
  if (hasRole(user, "MANAGER") || hasRole(user, "FINANCE") || hasRole(user, "ADMIN")) return true;

  // Pure requester (common case) can only view own
  return isOwner(user, req);
}

export function canCreateRequest(user: User): boolean {
  // only Requester can create
  // (Admin can still manage roles/users, not create finance requests)
  return hasRole(user, "REQUESTER");
}

export function canEditDraft(user: User, req: FinanceRequest): boolean {
  // Admin can see everything but NOT edit requests (per your decision)
  if (hasRole(user, "ADMIN")) return false;

  return req.status === "DRAFT" && isOwner(user, req) && hasRole(user, "REQUESTER");
}

export function canSubmit(user: User, req: FinanceRequest): SimpleResult {
  const errors = [];

  if (!canEditDraft(user, req)) {
    errors.push({ field: "auth", message: "Not allowed to submit this request." });
    return { ok: false, errors };
  }

  if (req.status !== "DRAFT") {
    errors.push({ field: "status", message: "Only DRAFT requests can be submitted." });
    return { ok: false, errors };
  }

  const v = validateForSubmit(req);
  if (!v.ok) return v;

  return { ok: true };
}

export function canManagerDecide(user: User, req: FinanceRequest): boolean {
  if (!hasRole(user, "MANAGER")) return false;
  if (hasRole(user, "ADMIN") && !hasRole(user, "MANAGER")) return false;
  return req.status === "WAITING_FOR_MANAGER";
}

export function canFinanceDecide(user: User, req: FinanceRequest): boolean {
  if (!hasRole(user, "FINANCE")) return false;
  if (hasRole(user, "ADMIN") && !hasRole(user, "FINANCE")) return false;
  return req.status === "WAITING_FOR_FINANCE";
}
