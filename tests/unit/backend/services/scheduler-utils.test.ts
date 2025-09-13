import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";

describe("Cron Expression Validation", () => {
  beforeEach(() => {
    // Mock the current time to a fixed date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:30:00Z")); // Monday, 10:30 AM UTC
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("CronExpressionParser validation", () => {
    it("should validate correct cron expressions", () => {
      const validExpressions = [
        "0 9 * * 1-5", // Weekdays at 9 AM
        "*/30 * * * *", // Every 30 minutes
        "0 */2 * * *", // Every 2 hours
        "0 0 1 * *", // First day of month
        "15 14 1 * *", // First day of month at 2:15 PM
        "0 22 * * 1-5", // Weekdays at 10 PM
        "5 4 * * 0", // Sundays at 4:05 AM
      ];

      validExpressions.forEach((expr) => {
        expect(() => CronExpressionParser.parse(expr)).not.toThrow();
      });
    });

    it("should reject invalid cron expressions", () => {
      const invalidExpressions = [
        "invalid",
        "0 9 * *", // Missing field
        "0 9 * * * *", // Too many fields
        "60 9 * * *", // Invalid minute
        "0 25 * * *", // Invalid hour
        "0 9 32 * *", // Invalid day
        "0 9 * 13 *", // Invalid month
        "0 9 * * 8", // Invalid day of week
        "", // Empty string
      ];

      invalidExpressions.forEach((expr) => {
        expect(() => CronExpressionParser.parse(expr)).toThrow();
      });
    });
  });

  describe("cronstrue integration", () => {
    it("should describe common cron expressions using cronstrue", () => {
      const expressions = [
        "0 9 * * 1-5", // Every weekday at 9:00 AM
        "0 9 * * *", // Every day at 9:00 AM
        "0 */2 * * *", // Every 2 hours
        "*/30 * * * *", // Every 30 minutes
      ];

      expressions.forEach((expr) => {
        const description = cronstrue.toString(expr);
        expect(description).toBeDefined();
        expect(description.length).toBeGreaterThan(0);
        expect(typeof description).toBe("string");
      });
    });

    it("should provide readable descriptions for complex expressions", () => {
      const complexExpressions = [
        "15 14 1 * *", // 2:15 PM on 1st of month
        "0 22 * * 1-5", // 10 PM on weekdays
        "5 4 * * 0", // 4:05 AM on Sundays
      ];

      complexExpressions.forEach((expr) => {
        const description = cronstrue.toString(expr);
        expect(description).toBeDefined();
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it("should handle invalid cron expressions gracefully", () => {
      const invalidExpressions = [
        "invalid",
        "60 9 * * *",
        "0 25 * * *",
        "",
        "0 9 * *", // Missing field
      ];

      invalidExpressions.forEach((expr) => {
        expect(() => {
          cronstrue.toString(expr);
        }).toThrow();
      });
    });

    it("should provide readable descriptions for various schedules", () => {
      const schedules = [
        { expr: "*/5 * * * *", shouldContain: "5 minutes" },
        { expr: "0 */3 * * *", shouldContain: "3 hours" },
        { expr: "0 9 * * 1", shouldContain: "Monday" },
        { expr: "0 9 1 * *", shouldContain: "1st" },
      ];

      schedules.forEach(({ expr, shouldContain }) => {
        const description = cronstrue.toString(expr);
        expect(description.toLowerCase()).toContain(
          shouldContain.toLowerCase()
        );
      });
    });
  });
});
