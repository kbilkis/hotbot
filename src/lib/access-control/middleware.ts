import { Context } from "hono";

import {
  canCreateGitProvider,
  canCreateMessagingProvider,
  canCreateCronJob,
  validateCronInterval,
  UsageValidationResult,
} from "./index";

/**
 * Error class for tier limit violations
 */
class TierLimitError extends Error {
  constructor(message: string, public validationResult: UsageValidationResult) {
    super(message);
    this.name = "TierLimitError";
  }
}

/**
 * Middleware to check git provider creation limits
 */
export async function checkGitProviderLimits(userId: string): Promise<void> {
  const validation = await canCreateGitProvider(userId);

  if (!validation.allowed) {
    throw new TierLimitError(
      validation.reason || "Git provider limit exceeded",
      validation
    );
  }
}

/**
 * Middleware to check messaging provider creation limits
 */
export async function checkMessagingProviderLimits(
  userId: string
): Promise<void> {
  const validation = await canCreateMessagingProvider(userId);

  if (!validation.allowed) {
    throw new TierLimitError(
      validation.reason || "Messaging provider limit exceeded",
      validation
    );
  }
}

/**
 * Middleware to check cron job creation limits
 */
export async function checkCronJobLimits(userId: string): Promise<void> {
  const validation = await canCreateCronJob(userId);

  if (!validation.allowed) {
    throw new TierLimitError(
      validation.reason || "Schedule limit exceeded",
      validation
    );
  }
}

/**
 * Middleware to validate cron job interval for user's tier
 */
export async function checkCronJobInterval(
  userId: string,
  cronExpression: string
): Promise<void> {
  const validation = await validateCronInterval(userId, cronExpression);

  if (!validation.allowed) {
    throw new TierLimitError(
      validation.reason || "Cron interval not allowed for current tier",
      validation
    );
  }
}

/**
 * Helper function to handle tier limit errors in API endpoints
 */
export function handleTierLimitError(error: unknown, c: Context) {
  if (error instanceof TierLimitError) {
    return c.json(
      {
        success: false,
        error: error.message,
        code: "TIER_LIMIT_EXCEEDED",
        details: error.validationResult,
        message: error.validationResult.reason,
      },
      403
    );
  }

  // Re-throw if it's not a tier limit error
  throw error;
}
