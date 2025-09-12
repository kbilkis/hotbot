CREATE TYPE "public"."execution_status" AS ENUM('success', 'error', 'partial');--> statement-breakpoint
CREATE TYPE "public"."git_provider" AS ENUM('github', 'bitbucket', 'gitlab');--> statement-breakpoint
CREATE TYPE "public"."messaging_provider" AS ENUM('slack', 'teams', 'discord');--> statement-breakpoint
CREATE TABLE "cron_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"cron_expression" text NOT NULL,
	"git_provider_id" uuid NOT NULL,
	"messaging_provider_id" uuid NOT NULL,
	"escalation_provider_id" uuid,
	"escalation_days" integer DEFAULT 3,
	"pr_filters" jsonb,
	"send_when_empty" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"last_executed" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "escalation_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cron_job_id" uuid NOT NULL,
	"pull_request_id" text NOT NULL,
	"pull_request_url" text NOT NULL,
	"first_escalated_at" timestamp DEFAULT now(),
	"last_escalated_at" timestamp DEFAULT now(),
	"escalation_count" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "execution_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cron_job_id" uuid NOT NULL,
	"executed_at" timestamp DEFAULT now(),
	"status" "execution_status" NOT NULL,
	"pull_requests_found" integer DEFAULT 0,
	"messages_sent" integer DEFAULT 0,
	"error_message" text,
	"execution_time_ms" integer,
	"escalations_triggered" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "git_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "git_provider" NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"repositories" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messaging_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "messaging_provider" NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"channel_id" text NOT NULL,
	"channel_name" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "cron_jobs" ADD CONSTRAINT "cron_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cron_jobs" ADD CONSTRAINT "cron_jobs_git_provider_id_git_providers_id_fk" FOREIGN KEY ("git_provider_id") REFERENCES "public"."git_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cron_jobs" ADD CONSTRAINT "cron_jobs_messaging_provider_id_messaging_providers_id_fk" FOREIGN KEY ("messaging_provider_id") REFERENCES "public"."messaging_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cron_jobs" ADD CONSTRAINT "cron_jobs_escalation_provider_id_messaging_providers_id_fk" FOREIGN KEY ("escalation_provider_id") REFERENCES "public"."messaging_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalation_tracking" ADD CONSTRAINT "escalation_tracking_cron_job_id_cron_jobs_id_fk" FOREIGN KEY ("cron_job_id") REFERENCES "public"."cron_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "execution_logs" ADD CONSTRAINT "execution_logs_cron_job_id_cron_jobs_id_fk" FOREIGN KEY ("cron_job_id") REFERENCES "public"."cron_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "git_providers" ADD CONSTRAINT "git_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messaging_providers" ADD CONSTRAINT "messaging_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;