ALTER TABLE "messaging_providers" DROP CONSTRAINT "messaging_providers_user_id_provider_unique";--> statement-breakpoint
ALTER TABLE "messaging_providers" ADD COLUMN "guild_id" text;--> statement-breakpoint
ALTER TABLE "messaging_providers" ADD COLUMN "guild_name" text;--> statement-breakpoint
ALTER TABLE "messaging_providers" ADD CONSTRAINT "messaging_providers_user_id_provider_guild_id_unique" UNIQUE("user_id","provider","guild_id");