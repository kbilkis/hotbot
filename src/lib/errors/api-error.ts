import { H } from "@highlight-run/cloudflare";
import type { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

// Helper function to handle errors with logging and return proper response
export function handleApiError(
  c: Context,
  error: unknown,
  statusCode: ContentfulStatusCode = 500,
  errorCode: string = "Internal Error",
  message: string = "An unexpected error occurred"
) {
  const errorToLog = error instanceof Error ? error : new Error(String(error));
  H.consumeError(errorToLog);
  c.executionCtx.waitUntil(H.flush());

  console.error("API Error:", error);

  // Return structured response for RPC types
  return c.json(
    {
      success: false as const,
      error: errorCode,
      message,
    },
    statusCode
  );
}

// Helper for common error scenarios
export function createErrorResponse(
  c: Context,
  statusCode: ContentfulStatusCode,
  errorCode: string,
  message: string
) {
  const error = new Error(message);
  return handleApiError(c, error, statusCode, errorCode, message);
}
