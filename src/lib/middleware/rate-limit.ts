import { Context, Next } from "hono";

export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export type RateLimiterType =
  | "API_RATE_LIMITER"
  | "WEBHOOK_RATE_LIMITER"
  | "EXPENSIVE_RATE_LIMITER"
  | "TUNNEL_RATE_LIMITER";

interface RateLimitOptions {
  limiter: RateLimiterType;
  keyGenerator?: (c: Context) => string;
  onRateLimit?: (c: Context) => Response | Promise<Response>;
}

/**
 * Rate limiting middleware using Cloudflare Workers Rate Limiting API
 */
function rateLimitMiddleware(options: RateLimitOptions) {
  const {
    limiter,
    keyGenerator = (c) => {
      // Default: use user ID if authenticated, otherwise IP
      const userId = c.get("userId");
      if (userId) return `user:${userId}`;

      const ip =
        c.req.header("cf-connecting-ip") ||
        c.req.header("x-forwarded-for") ||
        "unknown";
      return `ip:${ip}`;
    },
    onRateLimit = (c) =>
      c.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        429
      ),
  } = options;

  return async (c: Context, next: Next) => {
    const env = c.env;
    const rateLimiter = env[limiter];

    if (!rateLimiter) {
      console.warn(`Rate limiter ${limiter} not found in environment`);
      return next();
    }

    const key = keyGenerator(c);

    try {
      const { success } = await rateLimiter.limit({ key });

      if (!success) {
        return onRateLimit(c);
      }

      return next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      // On error, allow the request to proceed
      return next();
    }
  };
}

/**
 * Create a rate limiter for API routes (global rate limiting per user/IP)
 */
export const apiRateLimit = () =>
  rateLimitMiddleware({
    limiter: "API_RATE_LIMITER",
    keyGenerator: (c) => {
      const userId = c.get("userId");

      // Global rate limit per user across all API endpoints
      if (userId) {
        return `user:${userId}`;
      }

      // Fallback to fingerprinting for anonymous users
      const fingerprint = createFingerprint(c);
      return `anon:${fingerprint}`;
    },
  });

/**
 * Create a rate limiter for webhook endpoints
 */
export const webhookRateLimit = () =>
  rateLimitMiddleware({
    limiter: "WEBHOOK_RATE_LIMITER",
    keyGenerator: (c) => {
      const ip = c.req.header("cf-connecting-ip") || "unknown";
      return `webhook:${ip}`;
    },
  });

/**
 * Create a rate limiter for expensive endpoints (like sending messages)
 */
export const expensiveRateLimit = (operation: string) =>
  rateLimitMiddleware({
    limiter: "EXPENSIVE_RATE_LIMITER",
    keyGenerator: (c) => {
      const userId = c.get("userId");

      if (userId) {
        return `user:${userId}:${operation}`;
      }

      // For anonymous users, use fingerprinting
      const fingerprint = createFingerprint(c);
      return `anon:${fingerprint}:${operation}`;
    },
    onRateLimit: (c) =>
      c.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message: `Too many ${operation} requests. Please try again later.`,
        },
        429
      ),
  });

/**
 * Create a rate limiter for tunnel endpoints
 */
export const tunnelRateLimit = () =>
  rateLimitMiddleware({
    limiter: "TUNNEL_RATE_LIMITER",
    keyGenerator: (c) => {
      const userId = c.get("userId");

      if (userId) {
        return `user:${userId}:tunnel`;
      }

      // For anonymous users, use fingerprinting
      const fingerprint = createFingerprint(c);
      return `anon:${fingerprint}:tunnel`;
    },
  });

/**
 * Create a fingerprint for better rate limiting (more specific than just IP)
 */
function createFingerprint(c: Context): string {
  const ip = c.req.header("cf-connecting-ip") || "unknown";
  const userAgent = c.req.header("user-agent") || "";
  const acceptLanguage = c.req.header("accept-language") || "";

  // Create a simple hash of IP + User-Agent + Accept-Language
  const fingerprint = `${ip}:${userAgent.slice(0, 50)}:${acceptLanguage.slice(
    0,
    20
  )}`;
  return fingerprint;
}
