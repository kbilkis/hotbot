import { Request, Response } from "@google-cloud/functions-framework";
import * as Sentry from "@sentry/google-cloud-serverless";

export function wrapWithSentry(
  fn: (req: Request, res: Response) => Promise<void>
) {
  Sentry.init({
    dsn: process.env.SENTRY_FUNC_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
    sendDefaultPii: true,
    enableLogs: true,
  });

  return Sentry.wrapHttpFunction(async (req: Request, res: Response) => {
    const functionName =
      process.env.K_SERVICE || // Cloud Run service name (e.g., "notification-processor-dev")
      process.env.FUNCTION_NAME || // Cloud Functions 1st gen
      process.env.FUNCTION_TARGET || // Cloud Functions 2nd gen entry point (e.g., "notificationProcessor")
      "unknown-function";

    // Extract base function name if it includes environment suffix
    const baseFunctionName = functionName.replace(/-(?:dev|staging|prod)$/, "");

    Sentry.setTag("cloudFunction", baseFunctionName);
    Sentry.setTag("cloudFunctionFull", functionName);

    if (process.env.K_REVISION) {
      Sentry.setTag("cloudRunRevision", process.env.K_REVISION);
    }

    return fn(req, res);
  });
}
