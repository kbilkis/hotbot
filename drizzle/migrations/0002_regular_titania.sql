ALTER TABLE "messaging_providers" DROP CONSTRAINT "messaging_providers_user_id_provider_channel_id_unique";--> statement-breakpoint
ALTER TABLE "messaging_providers" DROP COLUMN "channel_id";--> statement-breakpoint
ALTER TABLE "messaging_providers" DROP COLUMN "channel_name";--> statement-breakpoint
ALTER TABLE "messaging_providers" ADD CONSTRAINT "messaging_providers_user_id_provider_unique" UNIQUE("user_id","provider");