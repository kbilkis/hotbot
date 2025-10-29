import {
  text,
  integer,
  unique,
  sqliteTable,
  index,
} from "drizzle-orm/sqlite-core";

// Helper function for timestamp fields with default values
const timestampField = (name: string) =>
  integer(name, { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull();

// Helper function for audit timestamp fields (createdAt + updatedAt)
const auditTimestamps = () => ({
  createdAt: timestampField("created_at"),
  updatedAt: timestampField("updated_at"),
});

// Define enum values as constants for type safety
export const GIT_PROVIDERS = ["github", "bitbucket", "gitlab"] as const;
export const GIT_CONNECTION_TYPES = [
  "user_oauth", // Personal OAuth (GitHub/GitLab/Bitbucket individual accounts)
  "group_oauth", // Group/Organization OAuth (GitLab group-owned apps - future)
  "github_app", // GitHub App installations (organization-wide with webhooks)
] as const;
export const MESSAGING_PROVIDERS = ["slack", "teams", "discord"] as const;
export const EXECUTION_STATUSES = ["success", "error", "partial"] as const;
export const SUBSCRIPTION_TIERS = ["free", "pro"] as const;
export const SUBSCRIPTION_STATUSES = [
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "trialing",
  "unpaid",
] as const;

// Types automatically derived from the const arrays above
export type GitProviderType = (typeof GIT_PROVIDERS)[number];
export type GitConnectionType = (typeof GIT_CONNECTION_TYPES)[number];
export type MessagingProviderType = (typeof MESSAGING_PROVIDERS)[number];
export type ExecutionStatusType = (typeof EXECUTION_STATUSES)[number];
export type SubscriptionTierType = (typeof SUBSCRIPTION_TIERS)[number];
export type SubscriptionStatusType = (typeof SUBSCRIPTION_STATUSES)[number];

// PR filters type definition
export interface PRFilters {
  labels?: string[];
  titleKeywords?: string[];
  excludeAuthors?: string[];
  minAge?: number; // days
  maxAge?: number; // days
}

// Users table - stores Clerk user information
export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clerkId: text("clerk_id").notNull().unique(), // Clerk user ID
    email: text("email").notNull(),
    ...auditTimestamps(),
  },
  (table) => [
    // Index on clerkId for authentication lookups
    index("users_clerk_id_idx").on(table.clerkId),
  ]
);

// Git provider connections
export const gitProviders = sqliteTable(
  "git_providers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    provider: text({ enum: GIT_PROVIDERS }).notNull(),
    connectionType: text("connection_type", { enum: GIT_CONNECTION_TYPES })
      .notNull()
      .default("user_oauth"),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    installationId: text("installation_id"), // For GitHub App installations
    ...auditTimestamps(),
  },
  (table) => [
    // Unique constraint: one provider per user
    unique().on(table.userId, table.provider),
    // Unique constraint: one installation per GitHub App (prevents installation hijacking)
    unique("unique_github_installation").on(table.installationId),
    // Index on userId for user-specific queries
    index("git_providers_user_id_idx").on(table.userId),
    // Index on expiresAt for token refresh queries
    index("git_providers_expires_at_idx").on(table.expiresAt),
    // Index on installationId for installation ownership queries
    index("git_providers_installation_id_idx").on(table.installationId),
  ]
);

// Messaging provider connections
export const messagingProviders = sqliteTable(
  "messaging_providers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    provider: text({ enum: MESSAGING_PROVIDERS }).notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    // Discord-specific fields (null for Slack/Teams)
    guildId: text("guild_id"), // Discord server/guild ID where bot was installed
    guildName: text("guild_name"), // Discord server/guild name for display
    ...auditTimestamps(),
  },
  (table) => [
    // Unique constraint: one provider per user (applies to all providers: Slack, Teams, Discord)
    // Each user can connect to only one guild/workspace per provider
    unique().on(table.userId, table.provider),
    // Index on userId for user-specific queries
    index("messaging_providers_user_id_idx").on(table.userId),
    // Index on provider for provider-specific queries
    index("messaging_providers_provider_idx").on(table.provider),
    // Composite index on userId + provider for user-specific provider queries
    index("messaging_providers_user_provider_idx").on(
      table.userId,
      table.provider
    ),
    // Index on expiresAt for token refresh queries
    index("messaging_providers_expires_at_idx").on(table.expiresAt),
  ]
);

// Cron jobs
export const cronJobs = sqliteTable(
  "cron_jobs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    cronExpression: text("cron_expression").notNull(), // Always stored in UTC
    gitProviderId: text("git_provider_id")
      .references(() => gitProviders.id, { onDelete: "cascade" })
      .notNull(),
    repositories: text("repositories", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    messagingProviderId: text("messaging_provider_id")
      .references(() => messagingProviders.id, { onDelete: "cascade" })
      .notNull(),
    messagingChannelId: text("messaging_channel_id").notNull(), // Channel/room ID where notifications are sent
    escalationProviderId: text("escalation_provider_id").references(
      () => messagingProviders.id,
      { onDelete: "set null" }
    ),
    escalationChannelId: text("escalation_channel_id"), // Channel/room ID for escalation notifications
    escalationDays: integer("escalation_days").default(3),
    prFilters: text("pr_filters", { mode: "json" }).$type<PRFilters>(),
    sendWhenEmpty: integer("send_when_empty", { mode: "boolean" })
      .default(false)
      .notNull(),
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    lastExecuted: integer("last_executed", { mode: "timestamp" }),
    ...auditTimestamps(),
  },
  (table) => [
    // Index on userId for user-specific cron job queries
    index("cron_jobs_user_id_idx").on(table.userId),
    // Index on isActive for execution queries
    index("cron_jobs_is_active_idx").on(table.isActive),
    // Composite index for user + active status
    index("cron_jobs_user_active_idx").on(table.userId, table.isActive),
  ]
);

// Execution logs - tracks cron job executions
export const executionLogs = sqliteTable("execution_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  cronJobId: text("cron_job_id")
    .references(() => cronJobs.id, { onDelete: "cascade" })
    .notNull(),
  executedAt: timestampField("executed_at"),
  status: text({ enum: EXECUTION_STATUSES }).notNull(),
  pullRequestsFound: integer("pull_requests_found").default(0).notNull(),
  messagesSent: integer("messages_sent").default(0).notNull(),
  errorMessage: text("error_message"),
  executionTimeMs: integer("execution_time_ms"),
  escalationsTriggered: integer("escalations_triggered").default(0).notNull(),
});

// Escalation tracking - prevents duplicate escalation notifications
export const escalationTracking = sqliteTable(
  "escalation_tracking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    cronJobId: text("cron_job_id")
      .references(() => cronJobs.id, { onDelete: "cascade" })
      .notNull(),
    pullRequestId: text("pull_request_id").notNull(), // External PR ID from git provider
    pullRequestUrl: text("pull_request_url").notNull(),
    firstEscalatedAt: timestampField("first_escalated_at"),
    lastEscalatedAt: timestampField("last_escalated_at"),
    escalationCount: integer("escalation_count").default(1).notNull(),
    createdAt: timestampField("created_at"),
  },
  (table) => [
    // Unique constraint: one escalation tracking per cron job + pull request
    unique().on(table.cronJobId, table.pullRequestId),
    // Index on cronJobId for job-specific escalation tracking
    index("escalation_tracking_cron_job_id_idx").on(table.cronJobId),
    // Index on pullRequestId for PR-specific queries
    index("escalation_tracking_pull_request_id_idx").on(table.pullRequestId),
  ]
);

// Subscriptions - tracks user subscription tiers and Stripe data
export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull()
      .unique(), // One subscription per user
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    tier: text({ enum: SUBSCRIPTION_TIERS }).notNull().default("free"),
    status: text({ enum: SUBSCRIPTION_STATUSES }).notNull().default("active"),
    currentPeriodStart: integer("current_period_start", { mode: "timestamp" }),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
    cancelAtPeriodEnd: integer("cancel_at_period_end", {
      mode: "boolean",
    })
      .default(false)
      .notNull(),
    ...auditTimestamps(),
  },
  (table) => [
    // Index on userId for user subscription lookups
    index("subscriptions_user_id_idx").on(table.userId),
    // Index on stripeCustomerId for Stripe webhook lookups
    index("subscriptions_stripe_customer_id_idx").on(table.stripeCustomerId),
    // Index on stripeSubscriptionId for Stripe webhook lookups
    index("subscriptions_stripe_subscription_id_idx").on(
      table.stripeSubscriptionId
    ),
  ]
);

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
