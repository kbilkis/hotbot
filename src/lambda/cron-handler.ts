/**
 * AWS Lambda handler for cron job processing
 */

import type { Context, ScheduledEvent } from "aws-lambda";

import { cronJobProcessor } from "../lib/cron/scheduler";

export const handler = async (
  event: ScheduledEvent,
  context: Context
): Promise<{ statusCode: number; body: string }> => {
  console.log(`[${new Date().toISOString()}] Lambda cron handler started`);
  console.log("Event:", JSON.stringify(event, null, 2));
  console.log("Context:", JSON.stringify(context, null, 2));

  try {
    await cronJobProcessor();

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "Cron job processor completed successfully",
        timestamp: new Date().toISOString(),
        requestId: context.awsRequestId,
      }),
    };

    console.log(
      `[${new Date().toISOString()}] Lambda execution completed successfully`
    );
    return response;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Lambda execution failed:`,
      error
    );

    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: "Cron job processor failed",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        requestId: context.awsRequestId,
      }),
    };

    return response;
  }
};
