import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

export function ApiSuccess<T>(data: T, meta?: ApiResponse["meta"], status = 200) {
  return NextResponse.json(
    { success: true, data, meta },
    { status }
  );
}

export function ApiError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

export function ApiUnauthorized(message = "Unauthorized") {
  return ApiError(message, 401);
}

export function ApiForbidden(message = "Forbidden - Insufficient permissions") {
  return ApiError(message, 403);
}

export function ApiNotFound(message = "Resource not found") {
  return ApiError(message, 404);
}

export function ApiInternalError(message = "Internal Server Error", error?: any) {
  
  return ApiError(message, 500);
}
