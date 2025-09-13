ALTER TABLE "cron_jobs" ADD COLUMN "messaging_channel_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cron_jobs" ADD COLUMN "escalation_channel_id" text;