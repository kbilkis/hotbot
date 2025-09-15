import { Redis } from "@upstash/redis";

// Validate required environment variables
if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error("UPSTASH_REDIS_REST_URL environment variable is required");
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_TOKEN environment variable is required");
}

// Initialize Redis client with configuration
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Redis key prefixes for different data types
export const REDIS_KEYS = {
  OAUTH_STATE: "oauth_state:",
  USER_SESSION: "user_session:",
  RATE_LIMIT: "rate_limit:",
  CACHE: "cache:",
} as const;

// Common TTL values (in seconds)
export const TTL = {
  OAUTH_STATE: 600, // 10 minutes
  USER_SESSION: 86400, // 24 hours
  RATE_LIMIT: 3600, // 1 hour
  CACHE_SHORT: 300, // 5 minutes
  CACHE_MEDIUM: 1800, // 30 minutes
  CACHE_LONG: 3600, // 1 hour
} as const;
