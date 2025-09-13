import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { eq, and } from "drizzle-orm";

import { db } from "../../../../src/lib/database/client";
import {
  createCronJob,
  getUserCronJobs,
  getCronJobById,
  updateCronJob,
  deleteCronJob,
  toggleCronJobStatus,
} from "../../../../src/lib/database/queries/cron-jobs";
import {
  cronJobs,
  users,
  gitProviders,
  messagingProviders,
} from "../../../../src/lib/database/schema";

// Mock data
const mockUserId = "test-user-123";
const mockGitProviderId = "git-provider-123";
const mockMessagingProviderId = "messaging-provider-123";

const mockCronJobData = {
  name: "Test Daily PR Reminder",
  cronExpression: "0 9 * * 1-5",
  gitProviderId: mockGitProviderId,
  messagingProviderId: mockMessagingProviderId,
  escalationProviderId: null,
  escalationDays: 3,
  prFilters: {
    labels: ["urgent", "hotfix", "bug"],
    titleKeywords: ["fix"],
  },
  sendWhenEmpty: false,
  isActive: true,
};

describe("Cron Job Database Operations", () => {
  let testJobId: string;

  beforeEach(async () => {
    // Clean up any existing test data
    await db.delete(cronJobs).where(eq(cronJobs.userId, mockUserId));
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(cronJobs).where(eq(cronJobs.userId, mockUserId));
  });

  describe("createCronJob", () => {
    it("should create a new cron job successfully", async () => {
      const job = await createCronJob(mockUserId, mockCronJobData);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.userId).toBe(mockUserId);
      expect(job.name).toBe(mockCronJobData.name);
      expect(job.cronExpression).toBe(mockCronJobData.cronExpression);
      expect(job.gitProviderId).toBe(mockCronJobData.gitProviderId);
      expect(job.messagingProviderId).toBe(mockCronJobData.messagingProviderId);
      expect(job.isActive).toBe(true);
      expect(job.createdAt).toBeDefined();
      expect(job.updatedAt).toBeDefined();

      testJobId = job.id;
    });

    it("should create a cron job with escalation settings", async () => {
      const jobDataWithEscalation = {
        ...mockCronJobData,
        escalationProviderId: mockMessagingProviderId,
        escalationDays: 5,
      };

      const job = await createCronJob(mockUserId, jobDataWithEscalation);

      expect(job.escalationProviderId).toBe(mockMessagingProviderId);
      expect(job.escalationDays).toBe(5);

      testJobId = job.id;
    });

    it("should create a cron job with PR filters", async () => {
      const job = await createCronJob(mockUserId, mockCronJobData);

      expect(job.prFilters).toEqual(mockCronJobData.prFilters);

      testJobId = job.id;
    });
  });

  describe("getUserCronJobs", () => {
    beforeEach(async () => {
      // Create test jobs
      const job1 = await createCronJob(mockUserId, {
        ...mockCronJobData,
        name: "Job 1",
      });
      const job2 = await createCronJob(mockUserId, {
        ...mockCronJobData,
        name: "Job 2",
        isActive: false,
      });
      testJobId = job1.id;
    });

    it("should return all cron jobs for a user", async () => {
      const jobs = await getUserCronJobs(mockUserId);

      expect(jobs).toHaveLength(2);
      expect(jobs[0].name).toBe("Job 2"); // Should be ordered by createdAt desc
      expect(jobs[1].name).toBe("Job 1");
    });

    it("should return empty array for user with no jobs", async () => {
      const jobs = await getUserCronJobs("non-existent-user");

      expect(jobs).toHaveLength(0);
    });
  });

  describe("getCronJobById", () => {
    beforeEach(async () => {
      const job = await createCronJob(mockUserId, mockCronJobData);
      testJobId = job.id;
    });

    it("should return cron job by ID for correct user", async () => {
      const job = await getCronJobById(testJobId, mockUserId);

      expect(job).toBeDefined();
      expect(job!.id).toBe(testJobId);
      expect(job!.userId).toBe(mockUserId);
      expect(job!.name).toBe(mockCronJobData.name);
    });

    it("should return null for non-existent job", async () => {
      const job = await getCronJobById("non-existent-id", mockUserId);

      expect(job).toBeNull();
    });

    it("should return null for job belonging to different user", async () => {
      const job = await getCronJobById(testJobId, "different-user");

      expect(job).toBeNull();
    });

    it("should return job without user check when userId not provided", async () => {
      const job = await getCronJobById(testJobId);

      expect(job).toBeDefined();
      expect(job!.id).toBe(testJobId);
    });
  });

  describe("updateCronJob", () => {
    beforeEach(async () => {
      const job = await createCronJob(mockUserId, mockCronJobData);
      testJobId = job.id;
    });

    it("should update cron job successfully", async () => {
      const updates = {
        name: "Updated Job Name",
        cronExpression: "0 10 * * *",
        isActive: false,
      };

      const updatedJob = await updateCronJob(testJobId, mockUserId, updates);

      expect(updatedJob).toBeDefined();
      expect(updatedJob!.name).toBe(updates.name);
      expect(updatedJob!.cronExpression).toBe(updates.cronExpression);
      expect(updatedJob!.isActive).toBe(false);
      expect(updatedJob!.updatedAt).toBeDefined();
    });

    it("should update PR filters", async () => {
      const updates = {
        prFilters: {
          labels: ["critical", "security"],
        },
      };

      const updatedJob = await updateCronJob(testJobId, mockUserId, updates);

      expect(updatedJob!.prFilters).toEqual(updates.prFilters);
    });

    it("should return null for non-existent job", async () => {
      const updates = { name: "Updated Name" };
      const result = await updateCronJob(
        "non-existent-id",
        mockUserId,
        updates
      );

      expect(result).toBeNull();
    });

    it("should return null for job belonging to different user", async () => {
      const updates = { name: "Updated Name" };
      const result = await updateCronJob(testJobId, "different-user", updates);

      expect(result).toBeNull();
    });
  });

  describe("toggleCronJobStatus", () => {
    beforeEach(async () => {
      const job = await createCronJob(mockUserId, mockCronJobData);
      testJobId = job.id;
    });

    it("should toggle job status to inactive", async () => {
      const updatedJob = await toggleCronJobStatus(
        testJobId,
        mockUserId,
        false
      );

      expect(updatedJob).toBeDefined();
      expect(updatedJob!.isActive).toBe(false);
    });

    it("should toggle job status to active", async () => {
      // First make it inactive
      await toggleCronJobStatus(testJobId, mockUserId, false);

      // Then toggle back to active
      const updatedJob = await toggleCronJobStatus(testJobId, mockUserId, true);

      expect(updatedJob).toBeDefined();
      expect(updatedJob!.isActive).toBe(true);
    });

    it("should return null for non-existent job", async () => {
      const result = await toggleCronJobStatus(
        "non-existent-id",
        mockUserId,
        false
      );

      expect(result).toBeNull();
    });
  });

  describe("deleteCronJob", () => {
    beforeEach(async () => {
      const job = await createCronJob(mockUserId, mockCronJobData);
      testJobId = job.id;
    });

    it("should delete cron job successfully", async () => {
      const deleted = await deleteCronJob(testJobId, mockUserId);

      expect(deleted).toBe(true);

      // Verify job is deleted
      const job = await getCronJobById(testJobId, mockUserId);
      expect(job).toBeNull();
    });

    it("should return false for non-existent job", async () => {
      const deleted = await deleteCronJob("non-existent-id", mockUserId);

      expect(deleted).toBe(false);
    });

    it("should return false for job belonging to different user", async () => {
      const deleted = await deleteCronJob(testJobId, "different-user");

      expect(deleted).toBe(false);

      // Verify job still exists
      const job = await getCronJobById(testJobId, mockUserId);
      expect(job).toBeDefined();
    });
  });
});

describe("Cron Job Validation", () => {
  describe("cron expression validation", () => {
    it("should accept valid cron expressions", async () => {
      const validExpressions = [
        "0 9 * * 1-5", // Weekdays at 9 AM
        "*/30 * * * *", // Every 30 minutes
        "0 */2 * * *", // Every 2 hours
        "0 0 1 * *", // First day of month
        "0 9 * * 0", // Sundays at 9 AM
      ];

      for (const cronExpression of validExpressions) {
        const job = await createCronJob(mockUserId, {
          ...mockCronJobData,
          cronExpression,
          name: `Test ${cronExpression}`,
        });

        expect(job).toBeDefined();
        expect(job.cronExpression).toBe(cronExpression);

        // Clean up
        await deleteCronJob(job.id, mockUserId);
      }
    });
  });

  describe("PR filters validation", () => {
    it("should handle empty PR filters", async () => {
      const job = await createCronJob(mockUserId, {
        ...mockCronJobData,
        prFilters: {},
      });

      expect(job.prFilters).toEqual({});

      await deleteCronJob(job.id, mockUserId);
    });

    it("should handle null PR filters", async () => {
      const job = await createCronJob(mockUserId, {
        ...mockCronJobData,
        prFilters: null,
      });

      expect(job.prFilters).toBeNull();

      await deleteCronJob(job.id, mockUserId);
    });
  });
});
