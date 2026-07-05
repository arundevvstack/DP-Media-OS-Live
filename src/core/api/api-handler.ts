import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { ApiError, ApiInternalError } from "./api-response";

export type HandlerContext = any;
type ApiHandlerFunc = (req: NextRequest, ctx: HandlerContext) => Promise<any>;

export function withApiHandler(handler: ApiHandlerFunc) {
  return async (req: NextRequest, ctx: HandlerContext) => {
    try {
      // Future: Inject session, enforce RBAC, audit log the request
      return await handler(req, ctx);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return ApiError("Validation Error: " + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '), 422);
      }
      
      if (error.name === 'UnauthorizedError') {
        return ApiError("Unauthorized", 401);
      }

      if (error.name === 'ForbiddenError') {
        return ApiError("Forbidden", 403);
      }

      if (error.name === 'NotFoundError') {
        return ApiError("Not Found", 404);
      }

      return ApiInternalError(error.message || "An unexpected error occurred", error);
    }
  };
}
