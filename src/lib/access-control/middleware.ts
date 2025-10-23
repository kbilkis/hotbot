import {
  canCreateMessagingProvider,
  canCreateCronJob,
  validateCronInterval,
  UsageValidationResult,
} from "./index";

/**
 * Error class for tier limit violations
 */
export class TierLimitError extends Error {
  constructor(message: string, public validationResult: UsageValidationResult) {
    super(message);
    this.name = "TierLimitError";
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
