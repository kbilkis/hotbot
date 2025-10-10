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

  return Sentry.wrapHttpFunction(fn);
}
