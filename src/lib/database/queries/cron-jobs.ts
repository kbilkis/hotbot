import { eq, and, desc } from "drizzle-orm";

import { db } from "../client";
import {
  cronJobs,
  executionLogs,
  escalationTracking,
  type CronJob,
  type NewCronJob,
  type ExecutionLog,
  type NewExecutionLog,
  type EscalationTracking,
  type NewEscalationTracking,
} from "../schema";

// Cron Job Queries

/**
 * Create a new cron job
 */
export async function createCronJob(
  userId: string,
  jobData: Omit<NewCronJob, "userId">
): Promise<CronJob> {
  const [job] = await db
    .insert(cronJobs)
    .values({
      ...jobData,
      userId,
    })
    .returning();

  return job;
}

/**
 * Get all cron jobs for a user
 */
export async function getUserCronJobs(userId: string): Promise<CronJob[]> {
  return await db
    .select()
    .from(cronJobs)
    .where(eq(cronJobs.userId, userId))
    .orderBy(desc(cronJobs.createdAt));
}

/**
 * Get cron job by ID (with user ownership check)
 */
export async function getCronJobById(
  id: string,
  userId?: string
): Promise<CronJob | null> {
  const conditions = [eq(cronJobs.id, id)];

  if (userId) {
    conditions.push(eq(cronJobs.userId, userId));
  }

  const [job] = await db
    .select()
    .from(cronJobs)
    .where(and(...conditions))
    .limit(1);

  return job || null;
}

/**
 * Get active cron jobs that should be executed
 */
export async function getActiveJobsForExecution(): Promise<CronJob[]> {
  return await db.select().from(cronJobs).where(eq(cronJobs.isActive, true));
}

/**
 * Update cron job
 */
export async function updateCronJob(
  id: string,
  userId: string,
  updates: Partial<Omit<CronJob, "id" | "userId" | "createdAt">>
): Promise<CronJob | null> {
  const [job] = await db
    .update(cronJobs)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(cronJobs.id, id), eq(cronJobs.userId, userId)))
    .returning();

  return job || null;
}

/**
 * Update last executed timestamp
 */
export async function updateJobLastExecuted(
  id: string,
  executedAt: Date = new Date()
): Promise<void> {
  await db
    .update(cronJobs)
    .set({
      lastExecuted: executedAt,
      updatedAt: new Date(),
    })
    .where(eq(cronJobs.id, id));
}

/**
 * Toggle cron job active status
 */
export async function toggleCronJobStatus(
  id: string,
  userId: string,
  isActive: boolean
): Promise<CronJob | null> {
  const [job] = await db
    .update(cronJobs)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(and(eq(cronJobs.id, id), eq(cronJobs.userId, userId)))
    .returning();

  return job || null;
}

/**
 * Delete cron job
 */
export async function deleteCronJob(
  id: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(cronJobs)
    .where(and(eq(cronJobs.id, id), eq(cronJobs.userId, userId)));

  return (result.rowsAffected ?? 0) > 0;
}

// Execution Log Queries

/**
 * Create execution log entry
 */
export async function createExecutionLog(
  logData: NewExecutionLog
): Promise<ExecutionLog> {
  const [log] = await db.insert(executionLogs).values(logData).returning();

  return log;
}

/**
 * Create or update escalation tracking
 */
export async function upsertEscalationTracking(
  trackingData: NewEscalationTracking
): Promise<EscalationTracking> {
  const [tracking] = await db
    .insert(escalationTracking)
    .values(trackingData)
    .onConflictDoUpdate({
      target: [escalationTracking.cronJobId, escalationTracking.pullRequestId],
      set: {
        lastEscalatedAt: new Date(),
        escalationCount: trackingData.escalationCount || 1,
      },
    })
    .returning();

  return tracking;
}

/**
 * Get escalation tracking for a specific PR
 */
export async function getEscalationTracking(
  cronJobId: string,
  pullRequestId: string
): Promise<EscalationTracking | null> {
  const [tracking] = await db
    .select()
    .from(escalationTracking)
    .where(
      and(
        eq(escalationTracking.cronJobId, cronJobId),
        eq(escalationTracking.pullRequestId, pullRequestId)
      )
    )
    .limit(1);

  return tracking || null;
}

/**
 * Clean up old escalation tracking (for closed PRs)
 */
export async function cleanupEscalationTracking(
  cronJobId: string,
  activePullRequestIds: string[]
): Promise<number> {
  if (activePullRequestIds.length === 0) {
    // If no active PRs, clean up all tracking for this job
    const result = await db
      .delete(escalationTracking)
      .where(eq(escalationTracking.cronJobId, cronJobId));

    return result.rowsAffected ?? 0;
  }

  // Clean up tracking for PRs that are no longer active
  const result = await db.delete(escalationTracking).where(
    and(
      eq(escalationTracking.cronJobId, cronJobId)
      // Note: This would need to be implemented with a NOT IN clause
      // For now, we'll handle this cleanup in the application logic
    )
  );

  return result.rowsAffected ?? 0;
}
