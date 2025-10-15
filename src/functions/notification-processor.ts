// Cloud Function 1: Notification Processor
// Invoked directly by Cloud Scheduler every minute

import { Request, Response } from "@google-cloud/functions-framework";

import { processScheduledNotifications } from "@/lib/notifications/processor";

import { wrapWithSentry } from "./sentry-helper";

export const notificationProcessor = wrapWithSentry(
  async (_req: Request, res: Response) => {
    const startTime = Date.now();
    console.log(
      `[${new Date().toISOString()}] Starting notification processor...`
    );

    await processScheduledNotifications();

    const executionTime = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] Notification processor completed in ${executionTime}ms`
    );
    res.status(200).json({
      success: true,
      executionTime,
    });
  }
);
