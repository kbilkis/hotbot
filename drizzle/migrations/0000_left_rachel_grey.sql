CREATE TABLE `cron_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`cron_expression` text NOT NULL,
	`git_provider_id` text NOT NULL,
	`repositories` text NOT NULL,
	`messaging_provider_id` text NOT NULL,
	`messaging_channel_id` text NOT NULL,
	`escalation_provider_id` text,
	`escalation_channel_id` text,
	`escalation_days` integer DEFAULT 3,
	`pr_filters` text,
	`send_when_empty` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`last_executed` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`git_provider_id`) REFERENCES `git_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`messaging_provider_id`) REFERENCES `messaging_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`escalation_provider_id`) REFERENCES `messaging_providers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `cron_jobs_user_id_idx` ON `cron_jobs` (`user_id`);--> statement-breakpoint
CREATE INDEX `cron_jobs_is_active_idx` ON `cron_jobs` (`is_active`);--> statement-breakpoint
CREATE INDEX `cron_jobs_user_active_idx` ON `cron_jobs` (`user_id`,`is_active`);--> statement-breakpoint
CREATE TABLE `escalation_tracking` (
	`id` text PRIMARY KEY NOT NULL,
	`cron_job_id` text NOT NULL,
	`pull_request_id` text NOT NULL,
	`pull_request_url` text NOT NULL,
	`first_escalated_at` integer,
	`last_escalated_at` integer,
	`escalation_count` integer DEFAULT 1,
	`created_at` integer,
	FOREIGN KEY (`cron_job_id`) REFERENCES `cron_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `escalation_tracking_cron_job_id_idx` ON `escalation_tracking` (`cron_job_id`);--> statement-breakpoint
CREATE INDEX `escalation_tracking_pull_request_id_idx` ON `escalation_tracking` (`pull_request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `escalation_tracking_cron_job_id_pull_request_id_unique` ON `escalation_tracking` (`cron_job_id`,`pull_request_id`);--> statement-breakpoint
CREATE TABLE `execution_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`cron_job_id` text NOT NULL,
	`executed_at` integer,
	`status` text NOT NULL,
	`pull_requests_found` integer DEFAULT 0,
	`messages_sent` integer DEFAULT 0,
	`error_message` text,
	`execution_time_ms` integer,
	`escalations_triggered` integer DEFAULT 0,
	FOREIGN KEY (`cron_job_id`) REFERENCES `cron_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `git_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`expires_at` integer,
	`repositories` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `git_providers_user_id_idx` ON `git_providers` (`user_id`);--> statement-breakpoint
CREATE INDEX `git_providers_expires_at_idx` ON `git_providers` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `git_providers_user_id_provider_unique` ON `git_providers` (`user_id`,`provider`);--> statement-breakpoint
CREATE TABLE `messaging_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`expires_at` integer,
	`guild_id` text,
	`guild_name` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messaging_providers_user_id_idx` ON `messaging_providers` (`user_id`);--> statement-breakpoint
CREATE INDEX `messaging_providers_provider_idx` ON `messaging_providers` (`provider`);--> statement-breakpoint
CREATE INDEX `messaging_providers_user_provider_idx` ON `messaging_providers` (`user_id`,`provider`);--> statement-breakpoint
CREATE INDEX `messaging_providers_expires_at_idx` ON `messaging_providers` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `messaging_providers_user_id_provider_unique` ON `messaging_providers` (`user_id`,`provider`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`stripe_customer_id` text NOT NULL,
	`stripe_subscription_id` text,
	`tier` text DEFAULT 'free' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`current_period_start` integer,
	`current_period_end` integer,
	`cancel_at_period_end` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_user_id_unique` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_customer_id_unique` ON `subscriptions` (`stripe_customer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_subscription_id_unique` ON `subscriptions` (`stripe_subscription_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_id_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_stripe_customer_id_idx` ON `subscriptions` (`stripe_customer_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_stripe_subscription_id_idx` ON `subscriptions` (`stripe_subscription_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_id` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);--> statement-breakpoint
CREATE INDEX `users_clerk_id_idx` ON `users` (`clerk_id`);