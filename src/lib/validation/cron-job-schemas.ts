import { type } from "arktype";
import { CronExpressionParser } from "cron-parser";

// PR Filters schema
export const PRFiltersSchema = type({
  "labels?": "string[]",
  "titleKeywords?": "string[]",
  "excludeAuthors?": "string[]",
  "minAge?": "number",
  "maxAge?": "number",
});

// Base cron job data schema
export const CronJobDataSchema = type({
  name: "string",
  cronExpression: "string",
  gitProviderId: "string",
  repositories: "string[]",
  messagingProviderId: "string",
  messagingChannelId: "string",
  "escalationProviderId?": "string",
  "escalationChannelId?": "string",
  "escalationDays?": "number",
  "prFilters?": {
    "labels?": "string[]",
    "titleKeywords?": "string[]",
    "excludeAuthors?": "string[]",
    "minAge?": "number",
    "maxAge?": "number",
  },
  "sendWhenEmpty?": "boolean",
  "isActive?": "boolean",
}).pipe((data, ctx) => {
  // Validate cron expression format using cron-parser
  try {
    CronExpressionParser.parse(data.cronExpression);
  } catch {
    return ctx.error(
      "Invalid cron expression format. Expected format: 'minute hour day month dayOfWeek'"
    );
  }

  // Validate escalation configuration
  if (data.escalationProviderId && !data.escalationDays) {
    return ctx.error(
      "escalationDays is required when escalationProviderId is provided"
    );
  }

  if (data.escalationProviderId && !data.escalationChannelId) {
    return ctx.error(
      "escalationChannelId is required when escalationProviderId is provided"
    );
  }

  if (data.escalationDays && data.escalationDays < 1) {
    return ctx.error("escalationDays must be at least 1");
  }

  // Validate PR filters
  if (data.prFilters) {
    if (data.prFilters.minAge && data.prFilters.minAge < 0) {
      return ctx.error("minAge must be non-negative");
    }
    if (data.prFilters.maxAge && data.prFilters.maxAge < 0) {
      return ctx.error("maxAge must be non-negative");
    }
    if (
      data.prFilters.minAge &&
      data.prFilters.maxAge &&
      data.prFilters.minAge > data.prFilters.maxAge
    ) {
      return ctx.error("minAge cannot be greater than maxAge");
    }
  }

  return data;
});

// Create cron job schema
export const CreateCronJobSchema = CronJobDataSchema;

// Update cron job schema (includes ID)
export const UpdateCronJobSchema = type({
  id: "string",
  name: "string",
  cronExpression: "string",
  gitProviderId: "string",
  repositories: "string[]",
  messagingProviderId: "string",
  messagingChannelId: "string",
  "escalationProviderId?": "string",
  "escalationChannelId?": "string",
  "escalationDays?": "number",
  "prFilters?": {
    "labels?": "string[]",
    "titleKeywords?": "string[]",
    "excludeAuthors?": "string[]",
    "minAge?": "number",
    "maxAge?": "number",
  },
  "sendWhenEmpty?": "boolean",
  "isActive?": "boolean",
}).pipe((data, ctx) => {
  // Validate cron expression format using cron-parser
  try {
    CronExpressionParser.parse(data.cronExpression);
  } catch {
    return ctx.error(
      "Invalid cron expression format. Expected format: 'minute hour day month dayOfWeek'"
    );
  }

  // Validate escalation configuration
  if (data.escalationProviderId && !data.escalationDays) {
    return ctx.error(
      "escalationDays is required when escalationProviderId is provided"
    );
  }

  if (data.escalationProviderId && !data.escalationChannelId) {
    return ctx.error(
      "escalationChannelId is required when escalationProviderId is provided"
    );
  }

  if (data.escalationDays && data.escalationDays < 1) {
    return ctx.error("escalationDays must be at least 1");
  }

  // Validate PR filters
  if (data.prFilters) {
    if (data.prFilters.minAge && data.prFilters.minAge < 0) {
      return ctx.error("minAge must be non-negative");
    }
    if (data.prFilters.maxAge && data.prFilters.maxAge < 0) {
      return ctx.error("maxAge must be non-negative");
    }
    if (
      data.prFilters.minAge &&
      data.prFilters.maxAge &&
      data.prFilters.minAge > data.prFilters.maxAge
    ) {
      return ctx.error("minAge cannot be greater than maxAge");
    }
  }

  return data;
});

// Toggle status schema
export const ToggleCronJobSchema = type({
  id: "string",
  isActive: "boolean",
});

// Query parameters for listing cron jobs (simplified - no pagination)
export const ListCronJobsQuerySchema = type({
  "active?": "string", // "true" or "false"
}).pipe((query, ctx) => {
  const result: {
    active?: boolean;
  } = {};

  if (query.active) {
    if (query.active !== "true" && query.active !== "false") {
      return ctx.error("active must be 'true' or 'false'");
    }
    result.active = query.active === "true";
  }

  return result;
});

// Export inferred types
export type PRFiltersData = typeof PRFiltersSchema.infer;
export type CronJobData = typeof CronJobDataSchema.infer;
export type CreateCronJobData = typeof CreateCronJobSchema.infer;
export type UpdateCronJobData = typeof UpdateCronJobSchema.infer;
export type ToggleCronJobData = typeof ToggleCronJobSchema.infer;
export type ListCronJobsQuery = typeof ListCronJobsQuerySchema.infer;
