/**
 * Filter processor - applies PR filters to pull request lists
 */

import type { PRFilters } from "../types/providers";

export interface PullRequest {
  id: string;
  title: string;
  author: string;
  url: string;
  createdAt: string;
  repository: string;
  labels?: string[];
  reviewers?: string[];
  hasApprovals?: boolean;
  hasChangesRequested?: boolean;
}

/**
 * Apply filters to a list of pull requests
 */
export function filterProcessor(
  pullRequests: PullRequest[],
  filters?: PRFilters | null
): PullRequest[] {
  if (!filters) {
    return pullRequests;
  }

  console.log(`Applying filters to ${pullRequests.length} pull requests`);

  let filteredPRs = [...pullRequests];

  // Filter by repositories
  if (filters.repositories && filters.repositories.length > 0) {
    const beforeCount = filteredPRs.length;
    filteredPRs = filteredPRs.filter((pr) =>
      filters.repositories!.includes(pr.repository)
    );
    console.log(
      `Repository filter: ${beforeCount} -> ${filteredPRs.length} PRs`
    );
  }

  // Filter by labels
  if (filters.labels && filters.labels.length > 0) {
    const beforeCount = filteredPRs.length;
    filteredPRs = filteredPRs.filter((pr) => {
      if (!pr.labels || pr.labels.length === 0) {
        return false;
      }

      return filters.labels!.some((filterLabel) =>
        pr.labels!.some((prLabel) =>
          prLabel.toLowerCase().includes(filterLabel.toLowerCase())
        )
      );
    });
    console.log(`Label filter: ${beforeCount} -> ${filteredPRs.length} PRs`);
  }

  // Filter by title keywords
  if (filters.titleKeywords && filters.titleKeywords.length > 0) {
    const beforeCount = filteredPRs.length;
    filteredPRs = filteredPRs.filter((pr) =>
      filters.titleKeywords!.some((keyword) =>
        pr.title.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    console.log(
      `Title keyword filter: ${beforeCount} -> ${filteredPRs.length} PRs`
    );
  }

  // Filter by excluded authors
  if (filters.excludeAuthors && filters.excludeAuthors.length > 0) {
    const beforeCount = filteredPRs.length;
    filteredPRs = filteredPRs.filter(
      (pr) => !filters.excludeAuthors!.includes(pr.author)
    );
    console.log(
      `Excluded authors filter: ${beforeCount} -> ${filteredPRs.length} PRs`
    );
  }

  // Filter by minimum age
  if (filters.minAge !== undefined && filters.minAge > 0) {
    const beforeCount = filteredPRs.length;
    const minAgeMs = filters.minAge * 24 * 60 * 60 * 1000;
    const now = Date.now();

    filteredPRs = filteredPRs.filter((pr) => {
      const prAge = now - new Date(pr.createdAt).getTime();
      return prAge >= minAgeMs;
    });
    console.log(
      `Minimum age filter (${filters.minAge} days): ${beforeCount} -> ${filteredPRs.length} PRs`
    );
  }

  // Filter by maximum age
  if (filters.maxAge !== undefined && filters.maxAge > 0) {
    const beforeCount = filteredPRs.length;
    const maxAgeMs = filters.maxAge * 24 * 60 * 60 * 1000;
    const now = Date.now();

    filteredPRs = filteredPRs.filter((pr) => {
      const prAge = now - new Date(pr.createdAt).getTime();
      return prAge <= maxAgeMs;
    });
    console.log(
      `Maximum age filter (${filters.maxAge} days): ${beforeCount} -> ${filteredPRs.length} PRs`
    );
  }

  console.log(`Final filtered result: ${filteredPRs.length} pull requests`);

  return filteredPRs;
}

/**
 * Validate PR filters configuration
 */
export function validateFilters(filters: PRFilters): string[] {
  const errors: string[] = [];

  if (filters.minAge !== undefined && filters.minAge < 0) {
    errors.push("Minimum age must be non-negative");
  }

  if (filters.maxAge !== undefined && filters.maxAge < 0) {
    errors.push("Maximum age must be non-negative");
  }

  if (
    filters.minAge !== undefined &&
    filters.maxAge !== undefined &&
    filters.minAge > filters.maxAge
  ) {
    errors.push("Minimum age cannot be greater than maximum age");
  }

  if (filters.repositories && filters.repositories.length === 0) {
    errors.push("Repository filter cannot be empty array");
  }

  if (filters.labels && filters.labels.length === 0) {
    errors.push("Labels filter cannot be empty array");
  }

  if (filters.titleKeywords && filters.titleKeywords.length === 0) {
    errors.push("Title keywords filter cannot be empty array");
  }

  if (filters.excludeAuthors && filters.excludeAuthors.length === 0) {
    errors.push("Excluded authors filter cannot be empty array");
  }

  return errors;
}

/**
 * Get a human-readable description of the applied filters
 */
export function getFiltersDescription(filters?: PRFilters | null): string {
  if (!filters) {
    return "No filters applied";
  }

  const descriptions: string[] = [];

  if (filters.repositories && filters.repositories.length > 0) {
    descriptions.push(`Repositories: ${filters.repositories.join(", ")}`);
  }

  if (filters.labels && filters.labels.length > 0) {
    descriptions.push(`Labels: ${filters.labels.join(", ")}`);
  }

  if (filters.titleKeywords && filters.titleKeywords.length > 0) {
    descriptions.push(`Title keywords: ${filters.titleKeywords.join(", ")}`);
  }

  if (filters.excludeAuthors && filters.excludeAuthors.length > 0) {
    descriptions.push(
      `Excluding authors: ${filters.excludeAuthors.join(", ")}`
    );
  }

  if (filters.minAge !== undefined) {
    descriptions.push(`Minimum age: ${filters.minAge} days`);
  }

  if (filters.maxAge !== undefined) {
    descriptions.push(`Maximum age: ${filters.maxAge} days`);
  }

  return descriptions.length > 0
    ? descriptions.join("; ")
    : "No filters applied";
}
