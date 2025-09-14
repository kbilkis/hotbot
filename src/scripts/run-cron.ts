#!/usr/bin/env tsx

/**
 * Development script to run cron job processor directly
 */

import { cronJobProcessor } from "../lib/cron/scheduler";

async function runCron() {
  console.log(`[${new Date().toISOString()}] Development cron runner started`);

  try {
    await cronJobProcessor();
    console.log(
      `[${new Date().toISOString()}] Cron job processor completed successfully`
    );
    process.exit(0);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Cron job processor failed:`,
      error
    );
    process.exit(1);
  }
}

// Run the cron job
runCron();
