// Cloud Function 2: Token Refresh Processor
// Invoked directly by Cloud Scheduler every 5 minutes

import { refreshExpiringTokens } from "../lib/oauth/scheduled-refresh";

export async function tokenProcessor(req: any, res: any) {
  const startTime = Date.now();
  console.log(
    `[${new Date().toISOString()}] Starting token refresh processor...`
  );

  try {
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
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Token refresh processor failed:`,
      error
    );
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
