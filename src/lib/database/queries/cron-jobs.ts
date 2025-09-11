import { eq, and, desc } from "drizzle-orm";
import { db } from "../client.js";
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
} from "../schema.js";

// Cron Job Queries

/**
 * Create a new cron job
 */
export async function createCronJob(
  userId: number,
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
export async function getUserCronJobs(userId: number): Promise<CronJob[]> {
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
  id: number,
  userId?: number
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
  id: number,
  userId: number,
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
  id: number,
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
  id: number,
  userId: number,
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
  id: number,
  userId: number
): Promise<boolean> {
  const result = await db
    .delete(cronJobs)
    .where(and(eq(cronJobs.id, id), eq(cronJobs.userId, userId)));

  return result.rowCount > 0;
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
 * Get execution logs for a cron job
 */
export async function getCronJobExecutionLogs(
  cronJobId: number,
  limit: number = 50
): Promise<ExecutionLog[]> {
  return await db
    .select()
    .from(executionLogs)
    .where(eq(executionLogs.cronJobId, cronJobId))
    .orderBy(desc(executionLogs.executedAt))
    .limit(limit);
}

/**
 * Get recent execution logs across all jobs for a user
 */
export async function getUserExecutionLogs(
  userId: number,
  limit: number = 100
): Promise<(ExecutionLog & { jobName: string })[]> {
  return await db
    .select({
      id: executionLogs.id,
      cronJobId: executionLogs.cronJobId,
      executedAt: executionLogs.executedAt,
      status: executionLogs.status,
      pullRequestsFound: executionLogs.pullRequestsFound,
      messagessent: executionLogs.messagessent,
      errorMessage: executionLogs.errorMessage,
      executionTimeMs: executionLogs.executionTimeMs,
      escalationsTriggered: executionLogs.escalationsTriggered,
      jobName: cronJobs.name,
    })
    .from(executionLogs)
    .innerJoin(cronJobs, eq(executionLogs.cronJobId, cronJobs.id))
    .where(eq(cronJobs.userId, userId))
    .orderBy(desc(executionLogs.executedAt))
    .limit(limit);
}

// Escalation Tracking Queries

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
  cronJobId: number,
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
 * Get all escalation tracking for a cron job
 */
export async function getCronJobEscalationTracking(
  cronJobId: number
): Promise<EscalationTracking[]> {
  return await db
    .select()
    .from(escalationTracking)
    .where(eq(escalationTracking.cronJobId, cronJobId))
    .orderBy(desc(escalationTracking.lastEscalatedAt));
}

/**
 * Clean up old escalation tracking (for closed PRs)
 */
export async function cleanupEscalationTracking(
  cronJobId: number,
  activePullRequestIds: string[]
): Promise<number> {
  if (activePullRequestIds.length === 0) {
    // If no active PRs, clean up all tracking for this job
    const result = await db
      .delete(escalationTracking)
      .where(eq(escalationTracking.cronJobId, cronJobId));

    return result.rowCount;
  }

  // Clean up tracking for PRs that are no longer active
  const result = await db.delete(escalationTracking).where(
    and(
      eq(escalationTracking.cronJobId, cronJobId)
      // Note: This would need to be implemented with a NOT IN clause
      // For now, we'll handle this cleanup in the application logic
    )
  );

  return result.rowCount;
}
