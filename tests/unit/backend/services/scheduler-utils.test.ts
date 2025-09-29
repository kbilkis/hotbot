/**
 * Unit tests for cron scheduler utilities
 */

import { describe, it, expect, vi } from "vitest";

import { PRFilters } from "@/lib/database/schema";

import {
  calculatePRAge,
  shouldEscalatePR,
} from "../../../../src/lib/notifications/escalation";
import {
  filterProcessor,
  validateFilters,
} from "../../../../src/lib/notifications/filters";

// Mock the database modules to avoid requiring environment variables
vi.mock("../../../../src/lib/database/client", () => ({
  db: {},
}));

vi.mock("../../../../src/lib/database/queries/cron-jobs", () => ({}));

describe("Filter Processor", () => {
  const mockPRs = [
    {
      id: "1",
      title: "Fix bug in authentication",
      author: "john",
      url: "https://github.com/repo/pr/1",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      repository: "org/repo1",
      labels: ["bug", "urgent"],
    },
    {
      id: "2",
      title: "Add new feature",
      author: "jane",
      url: "https://github.com/repo/pr/2",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      repository: "org/repo2",
      labels: ["feature"],
    },
    {
      id: "3",
      title: "Update documentation",
      author: "bob",
      url: "https://github.com/repo/pr/3",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      repository: "org/repo1",
      labels: ["docs"],
    },
  ];

  describe("filterProcessor", () => {
    it("should return all PRs when no filters are applied", () => {
      const result = filterProcessor(mockPRs);
      expect(result).toHaveLength(3);
      expect(result).toEqual(mockPRs);
    });

    it("should return all PRs when filters is null", () => {
      const result = filterProcessor(mockPRs, null);
      expect(result).toHaveLength(3);
      expect(result).toEqual(mockPRs);
    });

    it("should filter by labels", () => {
      const filters: PRFilters = {
        labels: ["bug"],
      };

      const result = filterProcessor(mockPRs, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should filter by title keywords", () => {
      const filters: PRFilters = {
        titleKeywords: ["feature"],
      };

      const result = filterProcessor(mockPRs, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should filter by excluded authors", () => {
      const filters: PRFilters = {
        excludeAuthors: ["john", "bob"],
      };

      const result = filterProcessor(mockPRs, filters);
      expect(result).toHaveLength(1);
      expect(result[0].author).toBe("jane");
    });

    it("should filter by minimum age", () => {
      const filters: PRFilters = {
        minAge: 3, // 3 days
      };

      const result = filterProcessor(mockPRs, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2"); // 5 days old
    });

    it("should filter by maximum age", () => {
      const filters: PRFilters = {
        maxAge: 3, // 3 days
      };

      const result = filterProcessor(mockPRs, filters);
      expect(result).toHaveLength(2);
      expect(result.map((pr) => pr.id)).toEqual(["1", "3"]); // 2 days and 1 day old
    });

    it("should apply multiple filters", () => {
      const filters: PRFilters = {
        labels: ["bug"],
      };

      const result = filterProcessor(mockPRs, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should return empty array when no PRs match filters", () => {
      const filters: PRFilters = {
        labels: ["nonexistent"],
      };

      const result = filterProcessor(mockPRs, filters);
      expect(result).toHaveLength(0);
    });
  });

  describe("validateFilters", () => {
    it("should return no errors for valid filters", () => {
      const filters: PRFilters = {
        labels: ["bug"],
        titleKeywords: ["fix"],
        excludeAuthors: ["bot"],
        minAge: 1,
        maxAge: 7,
      };

      const errors = validateFilters(filters);
      expect(errors).toHaveLength(0);
    });

    it("should return error for negative minimum age", () => {
      const filters: PRFilters = {
        minAge: -1,
      };

      const errors = validateFilters(filters);
      expect(errors).toContain("Minimum age must be non-negative");
    });

    it("should return error for negative maximum age", () => {
      const filters: PRFilters = {
        maxAge: -1,
      };

      const errors = validateFilters(filters);
      expect(errors).toContain("Maximum age must be non-negative");
    });

    it("should return error when minAge > maxAge", () => {
      const filters: PRFilters = {
        minAge: 7,
        maxAge: 3,
      };

      const errors = validateFilters(filters);
      expect(errors).toContain(
        "Minimum age cannot be greater than maximum age"
      );
    });

    it("should return error for empty arrays", () => {
      const filters: PRFilters = {
        labels: [],
        titleKeywords: [],
        excludeAuthors: [],
      };

      const errors = validateFilters(filters);
      expect(errors).toHaveLength(4);
      expect(errors).toContain("Repository filter cannot be empty array");
      expect(errors).toContain("Labels filter cannot be empty array");
      expect(errors).toContain("Title keywords filter cannot be empty array");
      expect(errors).toContain("Excluded authors filter cannot be empty array");
    });
  });
});

describe("Escalation Utilities", () => {
  describe("calculatePRAge", () => {
    it("should calculate PR age in days", () => {
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString();
      const age = calculatePRAge(threeDaysAgo);
      expect(age).toBe(3);
    });

    it("should return 0 for PRs created today", () => {
      const today = new Date().toISOString();
      const age = calculatePRAge(today);
      expect(age).toBe(0);
    });

    it("should handle fractional days", () => {
      const halfDayAgo = new Date(
        Date.now() - 12 * 60 * 60 * 1000
      ).toISOString();
      const age = calculatePRAge(halfDayAgo);
      expect(age).toBe(0); // Should floor to 0
    });
  });

  describe("shouldEscalatePR", () => {
    const mockPR = {
      id: "1",
      title: "Test PR",
      author: "test",
      url: "https://github.com/test/pr/1",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      repository: "test/repo",
    };

    it("should not escalate PR younger than threshold", () => {
      const shouldEscalate = shouldEscalatePR(mockPR, 7); // 7 day threshold, PR is 5 days old
      expect(shouldEscalate).toBe(false);
    });

    it("should escalate PR older than threshold with no previous escalation", () => {
      const shouldEscalate = shouldEscalatePR(mockPR, 3); // 3 day threshold, PR is 5 days old
      expect(shouldEscalate).toBe(true);
    });

    it("should not re-escalate if last escalation was recent", () => {
      const recentEscalation = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const shouldEscalate = shouldEscalatePR(mockPR, 3, recentEscalation);
      expect(shouldEscalate).toBe(false);
    });

    it("should re-escalate if last escalation was more than 7 days ago", () => {
      const oldEscalation = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const shouldEscalate = shouldEscalatePR(mockPR, 3, oldEscalation);
      expect(shouldEscalate).toBe(true);
    });
  });
});
