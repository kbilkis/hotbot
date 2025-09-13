import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import schedulesRoutes from "../../src/api/schedules";
import { db } from "../../src/lib/database/client";
import { cronJobs } from "../../src/lib/database/schema";

// Mock Clerk auth
vi.mock("@hono/clerk-auth", () => ({
  getAuth: vi.fn(() => ({
    userId: "test-user-123",
  })),
}));

// Create test app
const app = new Hono();
app.route("/api/schedules", schedulesRoutes);

// Test data
const mockUserId = "test-user-123";
const mockCronJobData = {
  name: "Test Daily PR Reminder",
  cronExpression: "0 9 * * 1-5",
  gitProviderId: "git-provider-123",
  messagingProviderId: "messaging-provider-123",
  escalationProviderId: null,
  escalationDays: 3,
  prFilters: {
    labels: ["urgent", "hotfix", "bug"],
    titleKeywords: ["fix"],
  },
  sendWhenEmpty: false,
  isActive: true,
};

describe("Cron Jobs API Integration Tests", () => {
  let testJobId: string;

  beforeEach(async () => {
    // Clean up any existing test data
    await db.delete(cronJobs).where(eq(cronJobs.userId, mockUserId));
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(cronJobs).where(eq(cronJobs.userId, mockUserId));
  });

  describe("POST /api/schedules", () => {
    it("should create a new cron job", async () => {
      const response = await app.request("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockCronJobData),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.message).toBe("Cron job created successfully");
      expect(data.job).toBeDefined();
      expect(data.job.id).toBeDefined();
      expect(data.job.name).toBe(mockCronJobData.name);
      expect(data.job.cronExpression).toBe(mockCronJobData.cronExpression);
      expect(data.job.nextExecution).toBeDefined();

      testJobId = data.job.id;
    });

    it("should reject invalid cron job data", async () => {
      const invalidData = {
        name: "Test Job",
        cronExpression: "invalid cron",
        gitProviderId: "git-123",
        messagingProviderId: "msg-123",
      };

      const response = await app.request("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
    });

    it("should reject missing required fields", async () => {
      const incompleteData = {
        name: "Test Job",
        // Missing cronExpression, gitProviderId, messagingProviderId
      };

      const response = await app.request("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incompleteData),
      });

      expect(response.status).toBe(400);
    });

    it("should create job with escalation settings", async () => {
      const jobWithEscalation = {
        ...mockCronJobData,
        escalationProviderId: "escalation-provider-123",
        escalationDays: 5,
      };

      const response = await app.request("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobWithEscalation),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.job.escalationProviderId).toBe("escalation-provider-123");
      expect(data.job.escalationDays).toBe(5);

      testJobId = data.job.id;
    });
  });

  describe("GET /api/schedules", () => {
    beforeEach(async () => {
      // Create test jobs
      const response1 = await app.request("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...mockCronJobData, name: "Job 1" }),
      });
      const job1 = await response1.json();

      const response2 = await app.request("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...mockCronJobData,
          name: "Job 2",
          isActive: false,
        }),
      });
      const job2 = await response2.json();

      testJobId = job1.job.id;
    });

    it("should list all cron jobs for user", async () => {
      const response = await app.request("/api/schedules");

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.jobs).toHaveLength(2);

      // Check that jobs have enhanced fields
      data.jobs.forEach((job) => {
        expect(job.nextExecution).toBeDefined();
      });
    });

    it("should filter jobs by active status", async () => {
      const response = await app.request("/api/schedules?active=true");

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.jobs).toHaveLength(1);
      expect(data.jobs[0].isActive).toBe(true);
    });

    it("should reject invalid query parameters", async () => {
      const response = await app.request("/api/schedules?active=invalid");

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/schedules/:id", () => {
    beforeEach(async () => {
      const response = await app.request("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockCronJobData),
      });
      const data = await response.json();
      testJobId = data.job.id;
    });

    it("should get specific cron job", async () => {
      const response = await app.request(`/api/schedules/${testJobId}`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.job).toBeDefined();
      expect(data.job.id).toBe(testJobId);
      expect(data.job.name).toBe(mockCronJobData.name);
      expect(data.job.nextExecution).toBeDefined();
    });

    it("should return 404 for non-existent job", async () => {
      const response = await app.request("/api/schedules/non-existent-id");

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe("Cron job not found");
    });
  });

  describe("PUT /api/schedules/:id", () => {
    beforeEach(async () => {
      const response = await app.request("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockCronJobData),
      });
      const data = await response.json();
      testJobId = data.job.id;
    });

    it("should update cron job", async () => {
      const updateData = {
        id: testJobId,
        ...mockCronJobData,
        name: "Updated Job Name",
        cronExpression: "0 10 * * *",
        isActive: false,
      };

      const response = await app.request(`/api/schedules/${testJobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe("Cron job updated successfully");
      expect(data.job.name).toBe("Updated Job Name");
      expect(data.job.cronExpression).toBe("0 10 * * *");
      expect(data.job.isActive).toBe(false);
    });

    it("should reject ID mismatch", async () => {
      const updateData = {
        id: "different-id",
        ...mockCronJobData,
        name: "Updated Job Name",
      };

      const response = await app.request(`/api/schedules/${testJobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe("ID mismatch");
    });

    it("should return 404 for non-existent job", async () => {
      const updateData = {
        id: "non-existent-id",
        ...mockCronJobData,
        name: "Updated Job Name",
      };

      const response = await app.request("/api/schedules/non-existent-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/schedules/:id", () => {
    beforeEach(async () => {
      const response = await app.request("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockCronJobData),
      });
      const data = await response.json();
      testJobId = data.job.id;
    });

    it("should delete cron job", async () => {
      const response = await app.request(`/api/schedules/${testJobId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe("Cron job deleted successfully");

      // Verify job is deleted
      const getResponse = await app.request(`/api/schedules/${testJobId}`);
      expect(getResponse.status).toBe(404);
    });

    it("should return 404 for non-existent job", async () => {
      const response = await app.request("/api/schedules/non-existent-id", {
        method: "DELETE",
      });

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe("Cron job not found");
    });
  });

  describe("POST /api/schedules/toggle", () => {
    beforeEach(async () => {
      const response = await app.request("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockCronJobData),
      });
      const data = await response.json();
      testJobId = data.job.id;
    });

    it("should toggle job to inactive", async () => {
      const response = await app.request("/api/schedules/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testJobId, isActive: false }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe("Cron job disabled successfully");
      expect(data.job.isActive).toBe(false);
    });

    it("should toggle job to active", async () => {
      // First disable it
      await app.request("/api/schedules/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testJobId, isActive: false }),
      });

      // Then enable it
      const response = await app.request("/api/schedules/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testJobId, isActive: true }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe("Cron job enabled successfully");
      expect(data.job.isActive).toBe(true);
    });

    it("should reject invalid toggle data", async () => {
      const response = await app.request("/api/schedules/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testJobId, isActive: "invalid" }),
      });

      expect(response.status).toBe(400);
    });

    it("should reject missing id", async () => {
      const response = await app.request("/api/schedules/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/schedules/next-execution", () => {
    beforeEach(async () => {
      const response = await app.request("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockCronJobData),
      });
      const data = await response.json();
      testJobId = data.job.id;
    });

    it("should get next execution time", async () => {
      const response = await app.request(
        `/api/schedules/next-execution?id=${testJobId}`
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.nextExecution).toBeDefined();
      expect(data.cronExpression).toBe(mockCronJobData.cronExpression);
    });

    it("should return 404 for non-existent job", async () => {
      const response = await app.request(
        "/api/schedules/next-execution?id=non-existent-id"
      );

      expect(response.status).toBe(404);
    });

    it("should return 400 for missing id parameter", async () => {
      const response = await app.request("/api/schedules/next-execution");

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe("Schedule ID is required");
    });
  });
});
