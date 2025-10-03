DROP INDEX "cron_jobs_user_id_idx";--> statement-breakpoint
DROP INDEX "cron_jobs_is_active_idx";--> statement-breakpoint
DROP INDEX "cron_jobs_user_active_idx";--> statement-breakpoint
DROP INDEX "escalation_tracking_cron_job_id_idx";--> statement-breakpoint
DROP INDEX "escalation_tracking_pull_request_id_idx";--> statement-breakpoint
DROP INDEX "escalation_tracking_cron_job_id_pull_request_id_unique";--> statement-breakpoint
DROP INDEX "git_providers_user_id_idx";--> statement-breakpoint
DROP INDEX "git_providers_expires_at_idx";--> statement-breakpoint
DROP INDEX "git_providers_user_id_provider_unique";--> statement-breakpoint
DROP INDEX "messaging_providers_user_id_idx";--> statement-breakpoint
DROP INDEX "messaging_providers_provider_idx";--> statement-breakpoint
DROP INDEX "messaging_providers_user_provider_idx";--> statement-breakpoint
DROP INDEX "messaging_providers_expires_at_idx";--> statement-breakpoint
DROP INDEX "messaging_providers_user_id_provider_unique";--> statement-breakpoint
DROP INDEX "subscriptions_user_id_unique";--> statement-breakpoint
DROP INDEX "subscriptions_stripe_customer_id_unique";--> statement-breakpoint
DROP INDEX "subscriptions_stripe_subscription_id_unique";--> statement-breakpoint
DROP INDEX "subscriptions_user_id_idx";--> statement-breakpoint
DROP INDEX "subscriptions_stripe_customer_id_idx";--> statement-breakpoint
DROP INDEX "subscriptions_stripe_subscription_id_idx";--> statement-breakpoint
DROP INDEX "users_clerk_id_unique";--> statement-breakpoint
DROP INDEX "users_clerk_id_idx";--> statement-breakpoint
ALTER TABLE `cron_jobs` ALTER COLUMN "send_when_empty" TO "send_when_empty" integer NOT NULL;--> statement-breakpoint
CREATE INDEX `cron_jobs_user_id_idx` ON `cron_jobs` (`user_id`);--> statement-breakpoint
CREATE INDEX `cron_jobs_is_active_idx` ON `cron_jobs` (`is_active`);--> statement-breakpoint
CREATE INDEX `cron_jobs_user_active_idx` ON `cron_jobs` (`user_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `escalation_tracking_cron_job_id_idx` ON `escalation_tracking` (`cron_job_id`);--> statement-breakpoint
CREATE INDEX `escalation_tracking_pull_request_id_idx` ON `escalation_tracking` (`pull_request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `escalation_tracking_cron_job_id_pull_request_id_unique` ON `escalation_tracking` (`cron_job_id`,`pull_request_id`);--> statement-breakpoint
CREATE INDEX `git_providers_user_id_idx` ON `git_providers` (`user_id`);--> statement-breakpoint
CREATE INDEX `git_providers_expires_at_idx` ON `git_providers` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `git_providers_user_id_provider_unique` ON `git_providers` (`user_id`,`provider`);--> statement-breakpoint
CREATE INDEX `messaging_providers_user_id_idx` ON `messaging_providers` (`user_id`);--> statement-breakpoint
CREATE INDEX `messaging_providers_provider_idx` ON `messaging_providers` (`provider`);--> statement-breakpoint
CREATE INDEX `messaging_providers_user_provider_idx` ON `messaging_providers` (`user_id`,`provider`);--> statement-breakpoint
CREATE INDEX `messaging_providers_expires_at_idx` ON `messaging_providers` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `messaging_providers_user_id_provider_unique` ON `messaging_providers` (`user_id`,`provider`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_user_id_unique` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_customer_id_unique` ON `subscriptions` (`stripe_customer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_subscription_id_unique` ON `subscriptions` (`stripe_subscription_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_id_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_stripe_customer_id_idx` ON `subscriptions` (`stripe_customer_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_stripe_subscription_id_idx` ON `subscriptions` (`stripe_subscription_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);--> statement-breakpoint
CREATE INDEX `users_clerk_id_idx` ON `users` (`clerk_id`);--> statement-breakpoint
ALTER TABLE `cron_jobs` ALTER COLUMN "is_active" TO "is_active" integer NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `cron_jobs` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `cron_jobs` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `escalation_tracking` ALTER COLUMN "first_escalated_at" TO "first_escalated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `escalation_tracking` ALTER COLUMN "last_escalated_at" TO "last_escalated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `escalation_tracking` ALTER COLUMN "escalation_count" TO "escalation_count" integer NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `escalation_tracking` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `execution_logs` ALTER COLUMN "executed_at" TO "executed_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `execution_logs` ALTER COLUMN "pull_requests_found" TO "pull_requests_found" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `execution_logs` ALTER COLUMN "messages_sent" TO "messages_sent" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `execution_logs` ALTER COLUMN "escalations_triggered" TO "escalations_triggered" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `git_providers` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `git_providers` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `messaging_providers` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `messaging_providers` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ALTER COLUMN "cancel_at_period_end" TO "cancel_at_period_end" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL;