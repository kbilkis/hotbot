import { type } from "arktype";
import { describe, it, expect } from "vitest";

import {
  PRFiltersSchema,
  CronJobDataSchema,
  CreateCronJobSchema,
  UpdateCronJobSchema,
  ToggleCronJobSchema,
  ListCronJobsQuerySchema,
} from "../../../../src/lib/validation/cron-job-schemas";

describe("Cron Job Validation Schemas", () => {
  describe("PRFiltersSchema", () => {
    it("should validate empty PR filters", () => {
      const result = PRFiltersSchema({});
      expect(result).toEqual({});
    });

    it("should validate PR filters with all fields", () => {
      const filters = {
        labels: ["urgent", "hotfix", "bug", "security"],
        titleKeywords: ["fix", "patch"],
        excludeAuthors: ["bot", "automated"],
        minAge: 1,
        maxAge: 7,
      };

      const result = PRFiltersSchema(filters);
      expect(result).toEqual(filters);
    });

    it("should validate PR filters with partial fields", () => {
      const filters = {
        labels: ["urgent"],
        minAge: 2,
      };

      const result = PRFiltersSchema(filters);
      expect(result).toEqual(filters);
    });

    it("should reject invalid field types", () => {
      const invalidFilters = {
        labels: "not-an-array",
        minAge: "not-a-number",
      };

      const result = PRFiltersSchema(invalidFilters);
      expect(result instanceof type.errors).toBe(true);
    });
  });

  describe("CronJobDataSchema", () => {
    const validJobData = {
      name: "Test Job",
      cronExpression: "0 9 * * 1-5",
      gitProviderId: "git-123",
      messagingProviderId: "msg-123",
    };

    it("should validate minimal valid cron job data", () => {
      const result = CronJobDataSchema(validJobData);
      expect(result).toEqual(validJobData);
    });

    it("should validate cron job data with all optional fields", () => {
      const fullJobData = {
        ...validJobData,
        escalationProviderId: "escalation-123",
        escalationDays: 5,
        prFilters: {
          labels: ["urgent", "bug"],
        },
        sendWhenEmpty: true,
        isActive: false,
      };

      const result = CronJobDataSchema(fullJobData);
      expect(result).toEqual(fullJobData);
    });

    it("should reject invalid cron expressions", () => {
      const invalidCronData = {
        ...validJobData,
        cronExpression: "invalid cron",
      };

      const result = CronJobDataSchema(invalidCronData);
      expect(result instanceof type.errors).toBe(true);
      if (result instanceof type.errors) {
        expect(result.summary).toContain("Invalid cron expression format");
      }
    });

    it("should reject escalationProviderId without escalationDays", () => {
      const invalidData = {
        ...validJobData,
        escalationProviderId: "escalation-123",
        // Missing escalationDays
      };

      const result = CronJobDataSchema(invalidData);
      expect(result instanceof type.errors).toBe(true);
      if (result instanceof type.errors) {
        expect(result.summary).toContain(
          "escalationDays is required when escalationProviderId is provided"
        );
      }
    });

    it("should reject negative escalationDays", () => {
      const invalidData = {
        ...validJobData,
        escalationProviderId: "escalation-123",
        escalationDays: -1,
      };

      const result = CronJobDataSchema(invalidData);
      expect(result instanceof type.errors).toBe(true);
      if (result instanceof type.errors) {
        expect(result.summary).toContain("escalationDays must be at least 1");
      }
    });

    it("should reject negative minAge in PR filters", () => {
      const invalidData = {
        ...validJobData,
        prFilters: {
          minAge: -1,
        },
      };

      const result = CronJobDataSchema(invalidData);
      expect(result instanceof type.errors).toBe(true);
      if (result instanceof type.errors) {
        expect(result.summary).toContain("minAge must be non-negative");
      }
    });

    it("should reject minAge greater than maxAge", () => {
      const invalidData = {
        ...validJobData,
        prFilters: {
          minAge: 10,
          maxAge: 5,
        },
      };

      const result = CronJobDataSchema(invalidData);
      expect(result instanceof type.errors).toBe(true);
      if (result instanceof type.errors) {
        expect(result.summary).toContain(
          "minAge cannot be greater than maxAge"
        );
      }
    });

    describe("valid cron expressions", () => {
      const validCronExpressions = [
        "0 9 * * 1-5", // Weekdays at 9 AM
        "*/30 * * * *", // Every 30 minutes
        "0 */2 * * *", // Every 2 hours
        "0 0 1 * *", // First day of month at midnight
        "15 14 1 * *", // First day of month at 2:15 PM
        "0 22 * * 1-5", // Weekdays at 10 PM
        "23 0-20/2 * * *", // Every 2 hours from midnight to 8 PM at minute 23
        "5 4 * * 0", // Sundays at 4:05 AM
      ];

      validCronExpressions.forEach((cronExpression) => {
        it(`should accept valid cron expression: ${cronExpression}`, () => {
          const jobData = {
            ...validJobData,
            cronExpression,
          };

          const result = CronJobDataSchema(jobData);
          expect(result).toEqual(jobData);
        });
      });
    });

    describe("invalid cron expressions", () => {
      const invalidCronExpressions = [
        "invalid",
        "0 9 * *", // Missing day of week
        "60 9 * * *", // Invalid minute (60)
        "0 25 * * *", // Invalid hour (25)
        "0 9 32 * *", // Invalid day (32)
        "0 9 * 13 *", // Invalid month (13)
        "", // Empty string
      ];

      invalidCronExpressions.forEach((cronExpression) => {
        it(`should reject invalid cron expression: ${cronExpression}`, () => {
          const jobData = {
            ...validJobData,
            cronExpression,
          };

          const result = CronJobDataSchema(jobData);
          expect(result instanceof type.errors).toBe(true);
        });
      });
    });
  });

  describe("CreateCronJobSchema", () => {
    it("should be identical to CronJobDataSchema", () => {
      const jobData = {
        name: "Test Job",
        cronExpression: "0 9 * * 1-5",
        gitProviderId: "git-123",
        messagingProviderId: "msg-123",
      };

      const createResult = CreateCronJobSchema(jobData);
      const dataResult = CronJobDataSchema(jobData);

      expect(createResult).toEqual(dataResult);
    });
  });

  describe("UpdateCronJobSchema", () => {
    it("should validate update data with ID", () => {
      const updateData = {
        id: "job-123",
        name: "Updated Job",
        cronExpression: "0 10 * * 1-5",
        gitProviderId: "git-123",
        messagingProviderId: "msg-123",
      };

      const result = UpdateCronJobSchema(updateData);
      expect(result).toEqual(updateData);
    });

    it("should reject update data without ID", () => {
      const updateData = {
        name: "Updated Job",
        cronExpression: "0 10 * * 1-5",
        gitProviderId: "git-123",
        messagingProviderId: "msg-123",
      };

      const result = UpdateCronJobSchema(updateData);
      expect(result instanceof type.errors).toBe(true);
    });
  });

  describe("ToggleCronJobSchema", () => {
    it("should validate toggle data with true", () => {
      const toggleData = { id: "job-123", isActive: true };
      const result = ToggleCronJobSchema(toggleData);
      expect(result).toEqual(toggleData);
    });

    it("should validate toggle data with false", () => {
      const toggleData = { id: "job-123", isActive: false };
      const result = ToggleCronJobSchema(toggleData);
      expect(result).toEqual(toggleData);
    });

    it("should reject non-boolean values", () => {
      const invalidData = { id: "job-123", isActive: "true" };
      const result = ToggleCronJobSchema(invalidData);
      expect(result instanceof type.errors).toBe(true);
    });

    it("should reject missing isActive field", () => {
      const invalidData = { id: "job-123" };
      const result = ToggleCronJobSchema(invalidData);
      expect(result instanceof type.errors).toBe(true);
    });

    it("should reject missing id field", () => {
      const invalidData = { isActive: true };
      const result = ToggleCronJobSchema(invalidData);
      expect(result instanceof type.errors).toBe(true);
    });
  });

  describe("ListCronJobsQuerySchema", () => {
    it("should validate empty query", () => {
      const result = ListCronJobsQuerySchema({});
      expect(result).toEqual({});
    });

    it("should validate query with active=true", () => {
      const query = { active: "true" };
      const result = ListCronJobsQuerySchema(query);
      expect(result).toEqual({ active: true });
    });

    it("should validate query with active=false", () => {
      const query = { active: "false" };
      const result = ListCronJobsQuerySchema(query);
      expect(result).toEqual({ active: false });
    });

    it("should reject invalid active values", () => {
      const invalidQueries = [
        { active: "yes" },
        { active: "no" },
        { active: "1" },
        { active: "0" },
      ];

      invalidQueries.forEach((query) => {
        const result = ListCronJobsQuerySchema(query);
        expect(result instanceof type.errors).toBe(true);
      });
    });
  });
});
