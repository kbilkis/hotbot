/**
 * Escalation processor - handles escalation notifications for old pull requests
 */

import type { PullRequest } from "@/types/pull-request";

import {
  getEscalationTracking,
  upsertEscalationTracking,
  cleanupEscalationTracking,
} from "../database/queries/cron-jobs";
import type { CronJob, MessagingProvider } from "../database/schema";
import { formatDiscordPRMessage, sendDiscordChannelMessage } from "../discord";
import { sendSlackMessage, formatSlackPRMessage } from "../slack";

/**
 * Process escalation notifications for pull requests that exceed the age threshold
 */
export async function escalationProcessor(
  job: CronJob,
  escalationProvider: MessagingProvider,
  pullRequests: PullRequest[]
): Promise<number> {
  if (!job.escalationChannelId || !job.escalationDays) {
    return 0;
  }

  console.log(
    `Processing escalations for job ${job.name} (threshold: ${job.escalationDays} days)`
  );

  // Filter PRs that exceed the escalation threshold
  const escalationThresholdMs = job.escalationDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const escalationCandidates = pullRequests.filter((pr) => {
    const prAge = now - new Date(pr.createdAt).getTime();
    return prAge >= escalationThresholdMs;
  });

  if (escalationCandidates.length === 0) {
    console.log(
      `No pull requests exceed escalation threshold of ${job.escalationDays} days`
    );
    return 0;
  }

  console.log(
    `Found ${escalationCandidates.length} pull requests exceeding escalation threshold`
  );

  // Check which PRs haven't been escalated yet or need re-escalation
  const prsToEscalate: PullRequest[] = [];

  for (const pr of escalationCandidates) {
    const existingTracking = await getEscalationTracking(job.id, pr.id);

    if (existingTracking) {
      // Check if we should re-escalate (e.g., every 7 days after first escalation)
      const lastEscalatedAt = existingTracking.lastEscalatedAt;
      if (lastEscalatedAt) {
        const daysSinceLastEscalation =
          (now - lastEscalatedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceLastEscalation >= 7) {
          prsToEscalate.push(pr);

          // Update escalation tracking
          await upsertEscalationTracking({
            cronJobId: job.id,
            pullRequestId: pr.id,
            pullRequestUrl: pr.url,
            escalationCount: (existingTracking.escalationCount || 0) + 1,
          });

          console.log(
            `Re-escalating PR (count: ${
              (existingTracking.escalationCount || 0) + 1
            }): ${pr.title} (${pr.id})`
          );
        }
      }
    } else {
      // First time escalation
      prsToEscalate.push(pr);

      // Create escalation tracking
      await upsertEscalationTracking({
        cronJobId: job.id,
        pullRequestId: pr.id,
        pullRequestUrl: pr.url,
        escalationCount: 1,
      });

      console.log(`Escalating PR for first time: ${pr.title} (${pr.id})`);
    }
  }

  // Send escalation notification if there are PRs to escalate
  if (prsToEscalate.length > 0) {
    await sendEscalationNotification(job, escalationProvider, prsToEscalate);

    console.log(
      `Sent escalation notification for ${prsToEscalate.length} pull requests`
    );
  }

  // Clean up escalation tracking for PRs that are no longer in the active list
  const activePrIds = pullRequests.map((pr) => pr.id);
  await cleanupEscalationTracking(job.id, activePrIds);

  return prsToEscalate.length;
}

/**
 * Send escalation notification to the configured escalation channel
 */
async function sendEscalationNotification(
  job: CronJob,
  escalationProvider: MessagingProvider,
  pullRequests: PullRequest[]
): Promise<void> {
  if (!job.escalationChannelId) {
    throw new Error("No escalation channel configured");
  }

  if (escalationProvider.provider === "slack") {
    const message = formatSlackPRMessage(pullRequests, undefined, job.name);

    await sendSlackMessage(
      escalationProvider.accessToken,
      job.escalationChannelId,
      message
    );

    return;
  }

  if (escalationProvider.provider === "discord") {
    const message = formatDiscordPRMessage(pullRequests, undefined, job.name);

    // Use bot token to send escalation message to Discord channel
    await sendDiscordChannelMessage(job.escalationChannelId, message);

    return;
  }

  throw new Error(
    `Unsupported escalation provider: ${escalationProvider.provider}`
  );
}

/**
 * Calculate the age of a pull request in days
 */
export function calculatePRAge(createdAt: string): number {
  const now = Date.now();
  const prCreated = new Date(createdAt).getTime();
  return Math.floor((now - prCreated) / (1000 * 60 * 60 * 24));
}

/**
 * Check if a pull request should be escalated based on age and escalation settings
 */
export function shouldEscalatePR(
  pr: PullRequest,
  escalationDays: number,
  lastEscalatedAt?: Date
): boolean {
  const prAge = calculatePRAge(pr.createdAt);

  // PR must be older than escalation threshold
  if (prAge < escalationDays) {
    return false;
  }

  // If never escalated, escalate now
  if (!lastEscalatedAt) {
    return true;
  }

  // Re-escalate every 7 days after first escalation
  const daysSinceLastEscalation =
    (Date.now() - lastEscalatedAt.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceLastEscalation >= 7;
}
