import {
  getSubscriptionByUserId,
  getUserUsage,
} from "../database/queries/subscriptions";
import type { Subscription } from "../database/schema";

/**
 * Subscription tier type
 */
export type SubscriptionTier = "free" | "pro";

/**
 * Interface for tier limits
 */
export interface TierLimits {
  gitProviders: number | null; // null = unlimited
  messagingProviders: number | null;
  cronJobs: number | null;
  minCronInterval: number; // hours
}

/**
 * Tier configuration with limits and features
 */
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    gitProviders: 1,
    messagingProviders: 1,
    cronJobs: 1,
    minCronInterval: 24, // 24 hours minimum
  },
  pro: {
    gitProviders: null, // unlimited
    messagingProviders: null, // unlimited
    cronJobs: null, // unlimited
    minCronInterval: 0, // no minimum
  },
};

/**
 * Interface for user tier information
 */
export interface UserTierInfo {
  tier: SubscriptionTier;
  limits: TierLimits;
  subscription: Subscription | null;
}

/**
 * Interface for usage validation result
 */
export interface UsageValidationResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: {
    gitProvidersCount: number;
    messagingProvidersCount: number;
    cronJobsCount: number;
  };
  limits?: TierLimits;
}

/**
 * Get user's tier information including limits
 */
export async function getUserTierInfo(userId: string): Promise<UserTierInfo> {
  const subscription = await getSubscriptionByUserId(userId);

  // Default to free tier if no subscription found
  const tier: SubscriptionTier = subscription?.tier ?? "free";
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

  // Check if user has reached the limit
  if (currentUsage.gitProvidersCount >= limits.gitProviders) {
    return {
      allowed: false,
      reason: `Free tier is limited to ${limits.gitProviders} git provider${
        limits.gitProviders === 1 ? "" : "s"
      }. Upgrade to Pro for unlimited providers.`,
      currentUsage,
      limits,
    };
  }

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
  const hourMatch = hour.match(/^\*\/(\d+)$/);
  if (hourMatch) {
    return parseInt(hourMatch[1], 10);
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
 * Get user's current usage with tier limits
 */
export async function getUserUsageWithLimits(userId: string) {
  const [tierInfo, currentUsage] = await Promise.all([
    getUserTierInfo(userId),
    getUserUsage(userId),
  ]);

  return {
    tier: tierInfo.tier,
    limits: tierInfo.limits,
    usage: currentUsage,
    subscription: tierInfo.subscription,
  };
}

/**
 * Check if user has exceeded any tier limits (for cleanup/enforcement)
 */
export async function checkTierLimitViolations(userId: string) {
  const [tierInfo, currentUsage] = await Promise.all([
    getUserTierInfo(userId),
    getUserUsage(userId),
  ]);

  const { limits } = tierInfo;
  const violations: string[] = [];

  // Check git providers limit
  if (
    limits.gitProviders !== null &&
    currentUsage.gitProvidersCount > limits.gitProviders
  ) {
    violations.push(
      `Git providers: ${currentUsage.gitProvidersCount}/${limits.gitProviders}`
    );
  }

  // Check messaging providers limit
  if (
    limits.messagingProviders !== null &&
    currentUsage.messagingProvidersCount > limits.messagingProviders
  ) {
    violations.push(
      `Messaging providers: ${currentUsage.messagingProvidersCount}/${limits.messagingProviders}`
    );
  }

  // Check cron jobs limit
  if (
    limits.cronJobs !== null &&
    currentUsage.cronJobsCount > limits.cronJobs
  ) {
    violations.push(
      `Schedules: ${currentUsage.cronJobsCount}/${limits.cronJobs}`
    );
  }

  return {
    hasViolations: violations.length > 0,
    violations,
    tierInfo,
    currentUsage,
  };
}
/**
 * Helper function to get user's current tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const subscription = await getSubscriptionByUserId(userId);
  return subscription?.tier ?? "free";
}

/**
 * Helper function to get tier limits for a specific tier
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Helper function to get user's tier limits
 */
export async function getUserLimits(userId: string): Promise<TierLimits> {
  const tier = await getUserTier(userId);
  return getTierLimits(tier);
}

/**
 * Check if a tier has unlimited access for a specific resource
 */
export function hasUnlimitedAccess(
  tier: SubscriptionTier,
  resourceType: keyof TierLimits
): boolean {
  const limits = TIER_LIMITS[tier];
  const limit = limits[resourceType];

  // For numeric limits, null means unlimited
  if (typeof limit === "number") {
    return limit === null;
  }

  // For minCronInterval, 0 means no restriction
  if (resourceType === "minCronInterval") {
    return limit === 0;
  }

  return false;
}

/**
 * Get formatted limit description for UI display
 */
export function formatLimitDescription(
  tier: SubscriptionTier,
  resourceType: keyof TierLimits
): string {
  const limits = TIER_LIMITS[tier];
  const limit = limits[resourceType];

  switch (resourceType) {
    case "gitProviders":
      return limit === null
        ? "Unlimited"
        : `${limit} provider${limit === 1 ? "" : "s"}`;
    case "messagingProviders":
      return limit === null
        ? "Unlimited"
        : `${limit} provider${limit === 1 ? "" : "s"}`;
    case "cronJobs":
      return limit === null
        ? "Unlimited"
        : `${limit} schedule${limit === 1 ? "" : "s"}`;
    case "minCronInterval":
      return limit === 0
        ? "Any frequency"
        : `Minimum ${limit} hour${limit === 1 ? "" : "s"}`;
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

/**
 * Get upgrade prompt message based on resource type and tier
 */
export function getUpgradePromptMessage(
  resourceType: keyof TierLimits,
  tier: SubscriptionTier
): string {
  if (tier === "pro") return ""; // Pro users don't need upgrade prompts

  const resourceName = {
    gitProviders: "git providers",
    messagingProviders: "messaging providers",
    cronJobs: "schedules",
    minCronInterval: "frequent schedules",
  }[resourceType];

  return `Upgrade to Pro for unlimited ${resourceName} and advanced features.`;
}
