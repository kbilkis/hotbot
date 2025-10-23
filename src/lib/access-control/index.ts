import {
  getSubscriptionByUserId,
  getUserUsage,
} from "../database/queries/subscriptions";
import type { UserUsage } from "../database/queries/subscriptions";
import type { Subscription, SubscriptionTierType } from "../database/schema";

/**
 * Interface for tier limits
 */
interface TierLimits {
  gitProviders: number | null; // null = unlimited
  messagingProviders: number | null;
  activeRepositories: number | null; // null = unlimited
  cronJobs: number | null;
  minCronInterval: number; // hours
}

/**
 * Tier configuration with limits and features
 */
export const TIER_LIMITS: Record<SubscriptionTierType, TierLimits> = {
  free: {
    gitProviders: null, // unlimited providers
    messagingProviders: 1,
    activeRepositories: 3, // limit active repositories
    cronJobs: 2, // increased from 1
    minCronInterval: 24, // 24 hours minimum
  },
  pro: {
    gitProviders: null, // unlimited
    messagingProviders: null, // unlimited
    activeRepositories: null, // unlimited
    cronJobs: null, // unlimited
    minCronInterval: 0, // no minimum
  },
};

/**
 * Interface for user tier information
 */
interface UserTierInfo {
  tier: SubscriptionTierType;
  limits: TierLimits;
  subscription: Subscription | null;
}

/**
 * Interface for usage validation result
 */
export interface UsageValidationResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: UserUsage;
  limits?: TierLimits;
}

/**
 * Get user's tier information including limits
 */
async function getUserTierInfo(userId: string): Promise<UserTierInfo> {
  const subscription = await getSubscriptionByUserId(userId);

  // Default to free tier if no subscription found
  const tier: SubscriptionTierType = subscription?.tier ?? "free";
  const limits = TIER_LIMITS[tier];

  return {
    tier,
    limits,
    subscription,
  };
}

/**
 * Check if user can create a new git provider
 */
export async function canCreateGitProvider(
  userId: string
): Promise<UsageValidationResult> {
  const [tierInfo, currentUsage] = await Promise.all([
    getUserTierInfo(userId),
    getUserUsage(userId),
  ]);

  const { limits } = tierInfo;

  // Pro tier has unlimited git providers
  if (limits.gitProviders === null) {
    return { allowed: true };
  }

  // Git providers are now unlimited for all tiers
  // This function is kept for backward compatibility but always allows creation

  return { allowed: true, currentUsage, limits };
}

/**
 * Check if user can create a new messaging provider
 */
export async function canCreateMessagingProvider(
  userId: string
): Promise<UsageValidationResult> {
  const [tierInfo, currentUsage] = await Promise.all([
    getUserTierInfo(userId),
    getUserUsage(userId),
  ]);

  const { limits } = tierInfo;

  // Pro tier has unlimited messaging providers
  if (limits.messagingProviders === null) {
    return { allowed: true };
  }

  // Check if user has reached the limit
  if (currentUsage.messagingProvidersCount >= limits.messagingProviders) {
    return {
      allowed: false,
      reason: `Free tier is limited to ${
        limits.messagingProviders
      } messaging provider${
        limits.messagingProviders === 1 ? "" : "s"
      }. Upgrade to Pro for unlimited providers.`,
      currentUsage,
      limits,
    };
  }

  return { allowed: true, currentUsage, limits };
}

/**
 * Check if user can create a new cron job
 */
export async function canCreateCronJob(
  userId: string
): Promise<UsageValidationResult> {
  const [tierInfo, currentUsage] = await Promise.all([
    getUserTierInfo(userId),
    getUserUsage(userId),
  ]);

  const { limits } = tierInfo;

  // Pro tier has unlimited cron jobs
  if (limits.cronJobs === null) {
    return { allowed: true };
  }

  // Check if user has reached the limit
  if (currentUsage.cronJobsCount >= limits.cronJobs) {
    return {
      allowed: false,
      reason: `Free tier is limited to ${limits.cronJobs} schedule${
        limits.cronJobs === 1 ? "" : "s"
      }. Upgrade to Pro for unlimited schedules.`,
      currentUsage,
      limits,
    };
  }

  return { allowed: true, currentUsage, limits };
}

/**
 * Check if user can create a schedule for a new repository
 */
export async function canCreateScheduleForRepository(
  userId: string,
  repositories: string[]
): Promise<UsageValidationResult> {
  const [tierInfo, currentUsage] = await Promise.all([
    getUserTierInfo(userId),
    getUserUsage(userId),
  ]);

  const { limits } = tierInfo;

  // Pro tier has unlimited active repositories
  if (limits.activeRepositories === null) {
    return { allowed: true };
  }

  // Count how many new repositories would be added
  const newRepositoriesCount = repositories.filter(
    (repo) => !currentUsage.activeRepositories?.includes(repo)
  ).length;

  const totalActiveRepos =
    currentUsage.activeRepositoriesCount + newRepositoriesCount;

  // Check if user would exceed the limit
  if (totalActiveRepos > limits.activeRepositories) {
    return {
      allowed: false,
      reason: `Free tier is limited to ${
        limits.activeRepositories
      } active repositor${
        limits.activeRepositories === 1 ? "y" : "ies"
      }. Upgrade to Pro for unlimited repositories.`,
      currentUsage,
      limits,
    };
  }

  return { allowed: true, currentUsage, limits };
}

/**
 * Validate cron expression interval for user's tier
 */
export async function validateCronInterval(
  userId: string,
  cronExpression: string
): Promise<UsageValidationResult> {
  const tierInfo = await getUserTierInfo(userId);
  const { limits } = tierInfo;

  // Pro tier has no minimum interval restriction
  if (limits.minCronInterval === 0) {
    return { allowed: true };
  }

  // Parse cron expression to determine interval
  const intervalHours = parseCronIntervalHours(cronExpression);

  if (intervalHours < limits.minCronInterval) {
    return {
      allowed: false,
      reason: `Free tier requires a minimum interval of ${limits.minCronInterval} hours between executions. Upgrade to Pro for more frequent schedules.`,
      limits,
    };
  }

  return { allowed: true, limits };
}

/**
 * Parse cron expression to determine interval in hours
 * This is a simplified parser for common cron patterns
 */
function parseCronIntervalHours(cronExpression: string): number {
  const parts = cronExpression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error("Invalid cron expression format");
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Daily or more frequent (every day at specific time)
  if (
    hour !== "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return 24; // Daily
  }

  // Hourly patterns
  if (minute !== "*" && hour === "*") {
    return 1; // Every hour
  }

  // Every N hours pattern (e.g., "0 */6 * * *" for every 6 hours)
  const hourRegex = /^\*\/(\d+)$/;
  const hourMatch = hourRegex.exec(hour);
  if (hourMatch) {
    return Number.parseInt(hourMatch[1], 10);
  }

  // Weekly pattern (specific day of week)
  if (dayOfWeek !== "*" && dayOfWeek !== "0-6") {
    return 24 * 7; // Weekly
  }

  // Monthly pattern (specific day of month)
  if (dayOfMonth !== "*" && dayOfMonth !== "1-31") {
    return 24 * 30; // Approximately monthly
  }

  // Default to 24 hours for complex patterns we can't easily parse
  return 24;
}

/**
 * Helper function to get user's current tier
 */
export async function getUserTier(
  userId: string
): Promise<SubscriptionTierType> {
  const subscription = await getSubscriptionByUserId(userId);
  return subscription?.tier ?? "free";
}

/**
 * Helper function to get tier limits for a specific tier
 */
export function getTierLimits(tier: SubscriptionTierType): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Get formatted limit description for UI display
 */
export function formatLimitDescription(
  tier: SubscriptionTierType,
  resourceType: keyof TierLimits
): string {
  const limits = TIER_LIMITS[tier];
  const limit = limits[resourceType];

  if (limit === null) {
    return "Unlimited";
  }

  const pluralSuffix = limit === 1 ? "" : "s";

  switch (resourceType) {
    case "gitProviders":
    case "messagingProviders":
      return `${limit} provider${pluralSuffix}`;
    case "activeRepositories":
      return `${limit} active repositor${limit === 1 ? "y" : "ies"}`;
    case "cronJobs":
      return `${limit} schedule${pluralSuffix}`;
    case "minCronInterval":
      return limit === 0
        ? "Any frequency"
        : `Minimum ${limit} hour${pluralSuffix}`;
    default:
      return "Unknown";
  }
}

/**
 * Get usage percentage for a specific resource (for progress bars)
 */
export function getUsagePercentage(
  current: number,
  limit: number | null
): number {
  if (limit === null) return 0; // Unlimited
  if (limit === 0) return 100; // No limit allowed
  return Math.min(100, (current / limit) * 100);
}

/**
 * Check if user is approaching their limit (80% threshold)
 */
export function isApproachingLimit(
  current: number,
  limit: number | null
): boolean {
  if (limit === null) return false; // Unlimited
  return getUsagePercentage(current, limit) >= 80;
}
