import { ApiError } from "./errors";

export function errorResponse(code: string, message: string, status: number, details?: unknown) {
  return Response.json({ error: { code, message, ...(details !== undefined ? { details } : {}) } }, { status });
}

type RouteHandler<Ctx> = (req: Request, ctx: Ctx) => Promise<Response>;

// Wraps a route handler so any thrown ApiError (including from
// getDbUserOrThrow/requireRole) becomes a consistent JSON error response
// instead of an uncaught exception, and any other thrown error becomes a
// generic 500 that never leaks internals (Prisma errors, stack traces, etc).
export function withApiErrors<Ctx>(handler: RouteHandler<Ctx>): RouteHandler<Ctx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return errorResponse(err.code, err.message, err.status, err.details);
      }
      console.error("[api] unexpected error", err);
      return errorResponse("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
    }
  };
}
