import { Context } from "hono";

import {
  canCreateGitProvider,
  canCreateMessagingProvider,
  canCreateCronJob,
  validateCronInterval,
  type UsageValidationResult,
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
 * Hono middleware factory for git provider limits
 */
export function gitProviderLimitsMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "User not authenticated" }, 401);
      }

      await checkGitProviderLimits(userId);
      await next();
    } catch (error) {
      if (error instanceof TierLimitError) {
        return c.json(
          {
            error: error.message,
            code: "TIER_LIMIT_EXCEEDED",
            details: error.validationResult,
          },
          403
        );
      }
      throw error;
    }
  };
}

/**
 * Hono middleware factory for messaging provider limits
 */
export function messagingProviderLimitsMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "User not authenticated" }, 401);
      }

      await checkMessagingProviderLimits(userId);
      await next();
    } catch (error) {
      if (error instanceof TierLimitError) {
        return c.json(
          {
            error: error.message,
            code: "TIER_LIMIT_EXCEEDED",
            details: error.validationResult,
          },
          403
        );
      }
      throw error;
    }
  };
}

/**
 * Hono middleware factory for cron job limits
 */
export function cronJobLimitsMiddleware() {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "User not authenticated" }, 401);
      }

      await checkCronJobLimits(userId);

      // Also validate cron interval if cronExpression is in the request body
      const body = await c.req.json().catch(() => ({}));
      if (body.cronExpression) {
        await checkCronJobInterval(userId, body.cronExpression);
      }

      await next();
    } catch (error) {
      if (error instanceof TierLimitError) {
        return c.json(
          {
            error: error.message,
            code: "TIER_LIMIT_EXCEEDED",
            details: error.validationResult,
          },
          403
        );
      }
      throw error;
    }
  };
}

/**
 * Generic tier validation middleware that can be configured for different resource types
 */
export function tierValidationMiddleware(
  resourceType: "gitProvider" | "messagingProvider" | "cronJob"
) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "User not authenticated" }, 401);
      }
      let body: any = {};

      switch (resourceType) {
        case "gitProvider":
          await checkGitProviderLimits(userId);
          break;
        case "messagingProvider":
          await checkMessagingProviderLimits(userId);
          break;
        case "cronJob":
          await checkCronJobLimits(userId);
          // Also validate cron interval if present
          body = await c.req.json();

          if (body.cronExpression) {
            await checkCronJobInterval(userId, body.cronExpression);
          }
          break;
      }

      await next();
    } catch (error) {
      if (error instanceof TierLimitError) {
        return c.json(
          {
            error: error.message,
            code: "TIER_LIMIT_EXCEEDED",
            details: error.validationResult,
          },
          403
        );
      }
      throw error;
    }
  };
}

/**
 * Helper function to handle tier limit errors in API endpoints
 */
export function handleTierLimitError(error: unknown, c: Context) {
  if (error instanceof TierLimitError) {
    return c.json(
      {
        error: error.message,
        code: "TIER_LIMIT_EXCEEDED",
        details: error.validationResult,
      },
      403
    );
  }

  // Re-throw if it's not a tier limit error
  throw error;
}
