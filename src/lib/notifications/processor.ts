/**
 * Cron job scheduler - processes scheduled jobs and sends notifications
 */

import { CronExpressionParser } from "cron-parser";
import { eq } from "drizzle-orm";

import { db } from "../database/client";
import {
  getActiveJobsForExecution,
  updateJobLastExecuted,
  createExecutionLog,
} from "../database/queries/cron-jobs";
import {
  GitProvider,
  gitProviders,
  MessagingProvider,
  messagingProviders,
  type CronJob,
} from "../database/schema";
import { formatDiscordPRMessage, sendDiscordChannelMessage } from "../discord";
import { getGitHubPullRequests } from "../github";
import { getGitLabMergeRequests } from "../gitlab";
import { formatSlackPRMessage, PullRequest, sendSlackMessage } from "../slack";
import type { PRFilters } from "../types/providers";

import { escalationProcessor } from "./escalation";
import { filterProcessor } from "./filters";

/**
 * Main notification processor - runs every minute to check for due jobs and send notifications
 */
export async function processScheduledNotifications(): Promise<void> {
  const startTime = Date.now();

  try {
    // Get all active cron jobs
    const activeJobs = await getActiveJobsForExecution();

    if (activeJobs.length === 0) {
      console.log("No active cron jobs found");
      return;
    }

    console.log(`Found ${activeJobs.length} active cron jobs`);

    // Filter jobs that are due for execution
    const dueJobs = filterDueJobs(activeJobs);

    if (dueJobs.length === 0) {
      console.log("No jobs due for execution at this time");
      return;
    }

    console.log(`Processing ${dueJobs.length} due jobs`);

    // Process each due job
    const results = await Promise.allSettled(
      dueJobs.map((job) => processJob(job))
    );

    // Log overall results
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `Job processing completed: ${successful} successful, ${failed} failed`
    );

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Job ${dueJobs[index].name} failed:`, result.reason);
      }
    });
  } catch (error) {
    console.error("Cron job processor error:", error);
    throw error;
  } finally {
    const executionTime = Date.now() - startTime;
    console.log(`Total execution time: ${executionTime}ms`);
  }
}

/**
 * Filter jobs that are due for execution based on cron expression
 * All cron expressions are stored in UTC, so we parse them as UTC
 */
function filterDueJobs(jobs: CronJob[]): CronJob[] {
  const now = new Date();
  const currentMinute = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  );

  return jobs.filter((job) => {
    try {
      // Parse cron expression as UTC since all stored expressions are in UTC
      const cronExpression = CronExpressionParser.parse(job.cronExpression, {
        tz: "UTC",
      });

      // Get the most recent execution time that should have occurred
      // This tells us when the job was supposed to run (including right now)
      const prevRun = cronExpression.prev().toDate();
      // Normalize to minute precision for comparison
      const prevRunMinute = new Date(
        prevRun.getFullYear(),
        prevRun.getMonth(),
        prevRun.getDate(),
        prevRun.getHours(),
        prevRun.getMinutes()
      );

      // Job is due if:
      // 1. The most recent scheduled execution time is the current minute, AND
      // 2. Either it has never run, or last run was before this scheduled time
      const isDue =
        prevRunMinute.getTime() === currentMinute.getTime() &&
        (!job.lastExecuted ||
          (job.lastExecuted !== null &&
            (job.lastExecuted as Date).getTime() < prevRun.getTime()));

      if (isDue) {
        console.log(
          `Job "${job.name}" is due for execution (UTC cron: ${
            job.cronExpression
          }, scheduled for: ${prevRun.toISOString()})`
        );
      }

      return isDue;
    } catch (error) {
      console.error(
        `Invalid cron expression for job "${job.name}": ${job.cronExpression}`,
        error
      );
      return false;
    }
  });
}

/**
 * Process a single cron job
 */
async function processJob(job: CronJob): Promise<void> {
  const startTime = Date.now();
  let pullRequestsFound = 0;
  let messagesSent = 0;
  let escalationsTriggered = 0;
  let errorMessage: string | null = null;

  try {
    console.log(`Processing job: ${job.name} (ID: ${job.id})`);

    // Get provider connections by ID
    const [gitProvider, messagingProvider, escalationProvider] =
      await Promise.all([
        getGitProviderById(job.gitProviderId),
        getMessagingProviderById(job.messagingProviderId),
        job.escalationProviderId
          ? getMessagingProviderById(job.escalationProviderId)
          : null,
      ]);

    if (!gitProvider) {
      throw new Error(`Git provider not found for job ${job.name}`);
    }

    if (!messagingProvider) {
      throw new Error(`Messaging provider not found for job ${job.name}`);
    }

    // Fetch pull requests
    const pullRequests = await fetchPullRequests(job, gitProvider);
    pullRequestsFound = pullRequests.length;

    console.log(`Found ${pullRequestsFound} pull requests for job ${job.name}`);

    // Apply filters
    const filteredPRs = filterProcessor(pullRequests, job.prFilters);

    console.log(`${filteredPRs.length} pull requests after filtering`);

    // Send regular notifications if there are PRs or if sendWhenEmpty is true
    if (filteredPRs.length > 0 || job.sendWhenEmpty) {
      await sendNotification(job, messagingProvider, filteredPRs, false);
      messagesSent++;
    }

    // Process escalations if configured
    if (
      job.escalationProviderId &&
      escalationProvider &&
      job.escalationChannelId
    ) {
      const escalatedCount = await escalationProcessor(
        job,
        escalationProvider,
        filteredPRs
      );
      escalationsTriggered = escalatedCount;

      if (escalatedCount > 0) {
        messagesSent++;
      }
    }

    // Update last executed timestamp
    await updateJobLastExecuted(job.id);

    console.log(`Job ${job.name} completed successfully`);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Job ${job.name} failed:`, error);
    throw error;
  } finally {
    // Log execution results
    const executionTime = Date.now() - startTime;

    await createExecutionLog({
      cronJobId: job.id,
      status: errorMessage ? "error" : "success",
      pullRequestsFound,
      messagesSent,
      errorMessage,
      executionTimeMs: executionTime,
      escalationsTriggered,
    });
  }
}

/**
 * Fetch pull requests from git provider
 */
async function fetchPullRequests(job: CronJob, gitProvider: GitProvider) {
  if (gitProvider.provider === "github") {
    return await getGitHubPullRequests(
      gitProvider.accessToken,
      job.repositories,
      job.prFilters as PRFilters
    );
  }

  if (gitProvider.provider === "gitlab") {
    return await getGitLabMergeRequests(
      gitProvider.accessToken,
      job.repositories,
      job.prFilters as PRFilters
    );
  }

  throw new Error(`Unsupported git provider: ${gitProvider.provider}`);
}

/**
 * Send notification to messaging provider
 */
async function sendNotification(
  job: CronJob,
  messagingProvider: MessagingProvider,
  pullRequests: PullRequest[],
  isEscalation: boolean
) {
  const channelId = isEscalation
    ? job.escalationChannelId
    : job.messagingChannelId;

  if (!channelId) {
    throw new Error(
      `No channel configured for ${
        isEscalation ? "escalation" : "regular"
      } notifications`
    );
  }

  if (messagingProvider.provider === "slack") {
    console.log("Formatting Slack message", {
      pullRequestCount: pullRequests.length,
      isEscalation,
    });

    // Use the simplified formatSlackPRMessage function
    const message = formatSlackPRMessage(
      pullRequests,
      undefined, // repositoryName
      job.name // scheduleName
    );

    await sendSlackMessage(messagingProvider.accessToken, channelId, message);

    console.log(
      `Sent ${
        isEscalation ? "escalation" : "regular"
      } notification to Slack channel ${channelId} (${pullRequests.length} PRs)`
    );
    return;
  }

  if (messagingProvider.provider === "discord") {
    const message = formatDiscordPRMessage(pullRequests, undefined, job.name);

    // Use bot token to send message to Discord channel
    await sendDiscordChannelMessage(channelId, message);

    console.log(
      `Sent ${
        isEscalation ? "escalation" : "regular"
      } notification to Discord channel ${channelId}`
    );
    return;
  }

  throw new Error(
    `Unsupported messaging provider: ${messagingProvider.provider}`
  );
}

/**
 * Get git provider by ID
 */
async function getGitProviderById(providerId: string) {
  const [provider] = await db
    .select()
    .from(gitProviders)
    .where(eq(gitProviders.id, providerId))
    .limit(1);

  return provider || null;
}

/**
 * Get messaging provider by ID
 */
async function getMessagingProviderById(providerId: string) {
  const [provider] = await db
    .select()
    .from(messagingProviders)
    .where(eq(messagingProviders.id, providerId))
    .limit(1);

  return provider || null;
}
