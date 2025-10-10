// Cloud Function 2: Token Refresh Processor
// Invoked directly by Cloud Scheduler every 5 minutes

import { Request, Response } from "@google-cloud/functions-framework";

import { refreshExpiringTokens } from "../lib/oauth/scheduled-refresh";

import { wrapWithSentry } from "./sentry-helper";

export const tokenProcessor = wrapWithSentry(
  async (_req: Request, res: Response) => {
    const startTime = Date.now();
    console.log(
      `[${new Date().toISOString()}] Starting token refresh processor...`
    );

    const tokenResult = await refreshExpiringTokens();
    const tokensRefreshed =
      tokenResult.gitProvidersRefreshed +
      tokenResult.messagingProvidersRefreshed;

    if (tokensRefreshed > 0) {
      console.log(`Refreshed ${tokensRefreshed} tokens`);
    } else {
      console.log("No tokens needed refreshing");
    }

    if (tokenResult.errors.length > 0) {
      console.warn("Token refresh errors:", tokenResult.errors);
    }

    const executionTime = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] Token refresh processor completed in ${executionTime}ms`
    );

    res.status(200).json({
      success: tokenResult.errors.length === 0,
      tokensRefreshed,
      executionTime,
      errors: tokenResult.errors,
    });
  }
);
