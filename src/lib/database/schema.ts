import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// Users table - stores Clerk user information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(), // Clerk user ID
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Git provider connections
export const gitProviders = pgTable("git_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  provider: text("provider", {
    enum: ["github", "bitbucket", "gitlab"],
  }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  repositories: jsonb("repositories").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messaging provider connections
export const messagingProviders = pgTable("messaging_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  provider: text("provider", {
    enum: ["slack", "teams", "discord"],
  }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  channelId: text("channel_id").notNull(),
  channelName: text("channel_name"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PR filters type definition
export interface PRFilters {
  tags?: string[];
  labels?: string[];
  titleKeywords?: string[];
  excludeAuthors?: string[];
  minAge?: number; // days
  maxAge?: number; // days
}

// Cron jobs
export const cronJobs = pgTable("cron_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  cronExpression: text("cron_expression").notNull(),
  gitProviderId: integer("git_provider_id")
    .references(() => gitProviders.id, { onDelete: "cascade" })
    .notNull(),
  messagingProviderId: integer("messaging_provider_id")
    .references(() => messagingProviders.id, { onDelete: "cascade" })
    .notNull(),
  escalationProviderId: integer("escalation_provider_id").references(
    () => messagingProviders.id,
    { onDelete: "set null" }
  ),
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
  id: serial("id").primaryKey(),
  cronJobId: integer("cron_job_id")
    .references(() => cronJobs.id, { onDelete: "cascade" })
    .notNull(),
  executedAt: timestamp("executed_at").defaultNow(),
  status: text("status", {
    enum: ["success", "error", "partial"],
  }).notNull(),
  pullRequestsFound: integer("pull_requests_found").default(0),
  messagessent: integer("messages_sent").default(0),
  errorMessage: text("error_message"),
  executionTimeMs: integer("execution_time_ms"),
  escalationsTriggered: integer("escalations_triggered").default(0),
});

// Escalation tracking - prevents duplicate escalation notifications
export const escalationTracking = pgTable("escalation_tracking", {
  id: serial("id").primaryKey(),
  cronJobId: integer("cron_job_id")
    .references(() => cronJobs.id, { onDelete: "cascade" })
    .notNull(),
  pullRequestId: text("pull_request_id").notNull(), // External PR ID from git provider
  pullRequestUrl: text("pull_request_url").notNull(),
  firstEscalatedAt: timestamp("first_escalated_at").defaultNow(),
  lastEscalatedAt: timestamp("last_escalated_at").defaultNow(),
  escalationCount: integer("escalation_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
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
