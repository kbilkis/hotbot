#!/usr/bin/env node

/**
 * Cron execution system for git-messaging-scheduler
 *
 * This process runs scheduled cron jobs to:
 * - Fetch pull requests from configured git providers
 * - Apply filters to PRs
 * - Send notifications to messaging providers
 * - Handle escalation notifications for old PRs
 * - Log execution results
 */

import { cronJobProcessor } from "./lib/cron/scheduler";

async function main() {
  console.log(`[${new Date().toISOString()}] Starting cron job processor...`);

  try {
    await cronJobProcessor();
    console.log(
      `[${new Date().toISOString()}] Cron job processor completed successfully`
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Cron job processor failed:`,
      error
    );
    process.exit(1);
  }
  process.exit(0);
}

// Run the main function
main().catch((error) => {
  console.error(`[${new Date().toISOString()}] Fatal error:`, error);
  process.exit(1);
});
