export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INVALID_STATE"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const unauthenticated = (message = "You must be signed in to do this.") =>
  new ApiError("UNAUTHENTICATED", message, 401);

export const forbidden = (message = "You don't have permission to do this.") =>
  new ApiError("FORBIDDEN", message, 403);

export const notFound = (message = "The requested resource was not found.") =>
  new ApiError("NOT_FOUND", message, 404);

export const validationError = (message = "Invalid request.", details?: unknown) =>
  new ApiError("VALIDATION_ERROR", message, 400, details);

export const invalidState = (message: string) => new ApiError("INVALID_STATE", message, 409);

export const conflict = (message: string) => new ApiError("CONFLICT", message, 409);
