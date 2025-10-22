// Shared utilities for messaging providers
import type { PullRequest, PRCategory } from "../../types/pull-request";

/**
 * Categorize pull requests into standard categories
 */
export function categorizePRs(prs: PullRequest[]): PRCategory[] {
  // Separate PRs into categories using filter
  const readyToMerge = prs.filter(
    (pr) => pr.hasApprovals && !pr.hasChangesRequested
  );
  const needsChanges = prs.filter((pr) => pr.hasChangesRequested);
  const stale = prs.filter((pr) => {
    const ageInDays = calculateAgeInDays(pr.createdAt);
    return ageInDays >= 7 && !pr.hasApprovals && !pr.hasChangesRequested;
  });
  const underReview = prs.filter((pr) => {
    const ageInDays = calculateAgeInDays(pr.createdAt);
    return (
      ageInDays < 7 &&
      !pr.hasApprovals &&
      !pr.hasChangesRequested &&
      pr.reviewers &&
      pr.reviewers.length > 0
    );
  });
  const awaitingReview = prs.filter((pr) => {
    const ageInDays = calculateAgeInDays(pr.createdAt);
    return (
      ageInDays < 7 &&
      !pr.hasApprovals &&
      !pr.hasChangesRequested &&
      (!pr.reviewers || pr.reviewers.length === 0)
    );
  });

  return [
    { name: "Ready to Merge", emoji: "✅", prs: readyToMerge },
    { name: "Needs Changes", emoji: "🔧", prs: needsChanges },
    { name: "Under Review", emoji: "👀", prs: underReview },
    { name: "Stale", emoji: "⏰", prs: stale },
    { name: "Awaiting Review", emoji: "⏳", prs: awaitingReview },
  ];
}

/**
 * Calculate age of PR in days
 */
export function calculateAgeInDays(createdAt: string): number {
  return Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Format PR age as human-readable text
 */
export function formatAge(createdAt: string): string {
  const ageInDays = calculateAgeInDays(createdAt);

  if (ageInDays === 0) {
    return "today";
  } else if (ageInDays === 1) {
    return "1d";
  } else {
    return `${ageInDays}d`;
  }
}

/**
 * Truncate PR title to specified length
 */
export function truncateTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) {
    return title;
  }
  return title.substring(0, maxLength - 3) + "...";
}

/**
 * Format line count changes as text
 */
export function formatLineCount(
  additions?: number,
  deletions?: number
): string {
  if (additions !== undefined && deletions !== undefined) {
    return ` (+${additions}/-${deletions})`;
  }
  return "";
}

/**
 * Format labels for display (limit to first 3)
 */
export function formatLabels(labels?: string[]): string {
  if (!labels || labels.length === 0) {
    return "";
  }
  return ` [${labels.slice(0, 3).join("] [")}]`;
}

/**
 * Build summary line with category counts
 */
export function buildSummaryLine(categories: PRCategory[]): string {
  const shortNames: Record<string, string> = {
    "Ready to Merge": "ready",
    "Needs Changes": "changes",
    "Under Review": "review",
    Stale: "stale",
    "Awaiting Review": "waiting",
  };

  return categories
    .filter((cat) => cat.prs.length > 0)
    .map(
      (cat) =>
        `${cat.emoji}${cat.prs.length} ${
          shortNames[cat.name] || cat.name.toLowerCase()
        }`
    )
    .join(" ");
}

/**
 * Get default title for PR notifications
 */
export function getDefaultTitle(scheduleName?: string): string {
  return scheduleName || "DAILY REMINDER FOR OPEN PULL REQUESTS";
}

/**
 * Build empty state message
 */
export function buildEmptyStateMessage(
  title: string,
  repositoryName?: string
): string {
  return `📋 **${title.toUpperCase()}**\n\n✅ All clear! No open pull requests${
    repositoryName ? ` in ${repositoryName}` : ""
  }`;
}
