import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  uuid,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

// Define enums
export const gitProviderEnum = pgEnum("git_provider", [
  "github",
  "bitbucket",
  "gitlab",
]);
export const messagingProviderEnum = pgEnum("messaging_provider", [
  "slack",
  "teams",
  "discord",
]);
export const executionStatusEnum = pgEnum("execution_status", [
  "success",
  "error",
  "partial",
]);
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "trialing",
  "unpaid",
]);

// Users table - stores Clerk user information
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(), // Clerk user ID
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Git provider connections
export const gitProviders = pgTable(
  "git_providers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    provider: gitProviderEnum("provider").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    repositories: jsonb("repositories").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Unique constraint: one provider per user
    userProviderUnique: unique().on(table.userId, table.provider),
  })
);

// Messaging provider connections
export const messagingProviders = pgTable(
  "messaging_providers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    provider: messagingProviderEnum("provider").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Unique constraint: one provider per user
    userProviderUnique: unique().on(table.userId, table.provider),
  })
);

// PR filters type definition
export interface PRFilters {
  labels?: string[];
  titleKeywords?: string[];
  excludeAuthors?: string[];
  minAge?: number; // days
  maxAge?: number; // days
}

// Cron jobs
export const cronJobs = pgTable("cron_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  cronExpression: text("cron_expression").notNull(), // Always stored in UTC
  gitProviderId: uuid("git_provider_id")
    .references(() => gitProviders.id, { onDelete: "cascade" })
    .notNull(),
  repositories: jsonb("repositories").$type<string[]>().notNull(),
  messagingProviderId: uuid("messaging_provider_id")
    .references(() => messagingProviders.id, { onDelete: "cascade" })
    .notNull(),
  messagingChannelId: text("messaging_channel_id").notNull(), // Channel/room ID where notifications are sent
  escalationProviderId: uuid("escalation_provider_id").references(
    () => messagingProviders.id,
    { onDelete: "set null" }
  ),
  escalationChannelId: text("escalation_channel_id"), // Channel/room ID for escalation notifications
  escalationDays: integer("escalation_days").default(3),
  prFilters: jsonb("pr_filters").$type<PRFilters>(),
  sendWhenEmpty: boolean("send_when_empty").default(false),
  isActive: boolean("is_active").default(true),
  lastExecuted: timestamp("last_executed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Execution logs - tracks cron job executions
export const executionLogs = pgTable("execution_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  cronJobId: uuid("cron_job_id")
    .references(() => cronJobs.id, { onDelete: "cascade" })
    .notNull(),
  executedAt: timestamp("executed_at").defaultNow(),
  status: executionStatusEnum("status").notNull(),
  pullRequestsFound: integer("pull_requests_found").default(0),
  messagesSent: integer("messages_sent").default(0),
  errorMessage: text("error_message"),
  executionTimeMs: integer("execution_time_ms"),
  escalationsTriggered: integer("escalations_triggered").default(0),
});

// Escalation tracking - prevents duplicate escalation notifications
export const escalationTracking = pgTable(
  "escalation_tracking",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cronJobId: uuid("cron_job_id")
      .references(() => cronJobs.id, { onDelete: "cascade" })
      .notNull(),
    pullRequestId: text("pull_request_id").notNull(), // External PR ID from git provider
    pullRequestUrl: text("pull_request_url").notNull(),
    firstEscalatedAt: timestamp("first_escalated_at").defaultNow(),
    lastEscalatedAt: timestamp("last_escalated_at").defaultNow(),
    escalationCount: integer("escalation_count").default(1),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Unique constraint: one escalation tracking per cron job + pull request
    cronJobPullRequestUnique: unique().on(table.cronJobId, table.pullRequestId),
  })
);

// Subscriptions - tracks user subscription tiers and Stripe data
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(), // One subscription per user
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  tier: subscriptionTierEnum("tier").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type GitProvider = typeof gitProviders.$inferSelect;
export type NewGitProvider = typeof gitProviders.$inferInsert;

export type MessagingProvider = typeof messagingProviders.$inferSelect;
export type NewMessagingProvider = typeof messagingProviders.$inferInsert;

export type CronJob = typeof cronJobs.$inferSelect;
export type NewCronJob = typeof cronJobs.$inferInsert;

export type ExecutionLog = typeof executionLogs.$inferSelect;
export type NewExecutionLog = typeof executionLogs.$inferInsert;

export type EscalationTracking = typeof escalationTracking.$inferSelect;
export type NewEscalationTracking = typeof escalationTracking.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
