import { arktypeValidator } from "@hono/arktype-validator";
import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import {
  deleteMessagingProvider,
  getUserMessagingProvider,
  getUserMessagingProviderById,
  getUserMessagingProviders,
} from "@/lib/database/queries/providers";
import {
  MessagingProvider,
  MessagingProviderType,
} from "@/lib/database/schema";
import { getDiscordChannels, revokeDiscordToken } from "@/lib/discord";
import { createErrorResponse } from "@/lib/errors/api-error";
import { getSlackChannels, revokeSlackToken } from "@/lib/slack";
import {
  MessagingProviderQuerySchema,
  ChannelsQuerySchema,
} from "@/lib/validation/provider-schemas";

import discordRoutes from "./discord";
import slackRoutes from "./slack";
import teamsRoutes from "./teams";

export interface MessagingProviderDTO {
  id: string;
  type: MessagingProviderType;
  name: string;
  connected: true; // Always true since we only return connected providers
  connectedAt: string;
  providerId?: string;
}

const app = new Hono()
  // GET /api/providers/messaging - List all messaging providers
  .get("/", async (c) => {
    const userId = getCurrentUserId(c);

    const connectedProviders = await getUserMessagingProviders(userId);

    // Create a map of connected providers by type
    const providersByType = connectedProviders.reduce((acc, provider) => {
      acc[provider.provider] = provider;
      return acc;
    }, {} as Record<string, MessagingProvider>);

    // Group Discord providers by guild (since we can have multiple Discord connections)
    const discordProviders = connectedProviders.filter(
      (p) => p.provider === "discord"
    );

    const messagingProviders: MessagingProviderDTO[] = [
      // Only include connected providers
      ...(providersByType.slack
        ? [
            {
              id: providersByType.slack.id,
              type: "slack" as const,
              name: "Slack",
              connected: true as const,
              connectedAt: providersByType.slack.createdAt.toISOString(),
            },
          ]
        : []),
      ...(providersByType.teams
        ? [
            {
              id: providersByType.teams.id,
              type: "teams" as const,
              name: "Microsoft Teams",
              connected: true as const,
              connectedAt: providersByType.teams.createdAt.toISOString(),
            },
          ]
        : []),
      // For Discord, include all connected guilds as separate providers
      ...discordProviders.map((provider) => ({
        id: provider.id,
        type: "discord" as const,
        name: provider.guildName
          ? `Discord - ${provider.guildName}`
          : "Discord",
        connected: true as const,
        connectedAt: provider.createdAt.toISOString(),
        guildId: provider.guildId,
        guildName: provider.guildName,
      })),
    ];

    return c.json({
      success: true,
      message: "Messaging providers fetched successfully",
      data: { providers: messagingProviders },
    });
  })
  // GET /api/providers/messaging/channels - Get channels for a specific provider
  .get(
    "/channels",
    arktypeValidator("query", ChannelsQuerySchema),
    async (c) => {
      const { providerId, guildId } = c.req.valid("query");

      const userId = getCurrentUserId(c);

      // Get the messaging provider (secure - only returns if user owns it)
      const messagingProvider = await getUserMessagingProviderById(
        userId,
        providerId
      );

      if (!messagingProvider) {
        return createErrorResponse(
          c,
          404,
          "Provider not found",
          "Messaging provider not found or not connected"
        );
      }

      let channels: Array<{
        id: string;
        name: string;
        type?: string;
        isGuild?: boolean;
      }> = [];

      switch (messagingProvider.provider) {
        case "slack":
          channels = await getSlackChannels(messagingProvider.accessToken);
          break;

        case "discord":
          if (guildId) {
            // Get channels for specific guild
            const discordChannels = await getDiscordChannels(guildId);
            channels = discordChannels.map((channel) => ({
              id: channel.id,
              name: channel.name || `Channel ${channel.id}`,
              type: channel.type?.toString() || "text",
            }));
          } else {
            // Get all connected guilds for this provider
            const allProviders = await getUserMessagingProviders(
              userId,
              "discord"
            );
            channels = allProviders
              .filter((p) => p.guildId && p.guildName)
              .map((p) => ({
                id: p.guildId!,
                name: p.guildName!,
                type: "guild",
                isGuild: true,
              }));
          }
          break;

        case "teams":
          // TODO: Teams not implemented yet
          return createErrorResponse(
            c,
            501,
            "Teams provider not implemented",
            "Teams provider not implemented yet"
          );

        default:
          return createErrorResponse(
            c,
            400,
            "Unknown provider type",
            `Unknown provider type: ${messagingProvider.provider}`
          );
      }

      return c.json({
        success: true,
        message: "Channels fetched successfully",
        data: { channels },
      });
    }
  )
  // DELETE /api/providers/messaging - Disconnect messaging provider
  .delete(
    "/",
    arktypeValidator("query", MessagingProviderQuerySchema),
    async (c) => {
      const { type } = c.req.valid("query");
      const userId = getCurrentUserId(c);

      // Get the provider first to retrieve the access token
      const messagingProvider = await getUserMessagingProvider(userId, type);

      if (!messagingProvider) {
        return createErrorResponse(
          c,
          404,
          "Provider not found",
          `No connection found for ${type}`
        );
      }

      // Revoke the token from the provider's API before deleting from database
      try {
        switch (type) {
          case "slack":
            await revokeSlackToken(messagingProvider.accessToken);
            break;
          case "discord":
            await revokeDiscordToken(
              messagingProvider.accessToken,
              messagingProvider.guildId || undefined
            );
            break;
          case "teams":
            // TODO: Implement Teams token revocation when Teams support is added
            console.warn("Teams token revocation not yet implemented");
            break;
          default:
            console.warn(`Unknown provider type for token revocation: ${type}`);
        }
      } catch (error) {
        // Log the error but continue with database deletion
        // The token might already be invalid or the API might be down
        console.error(`Failed to revoke ${type} token:`, error);

        // Log to Sentry with request context - this is the only place we log this error
        Sentry.captureException(error);
      }

      const deleted = await deleteMessagingProvider(userId, type);

      if (!deleted) {
        return createErrorResponse(
          c,
          500,
          "Database error",
          `Failed to delete ${type} connection from database`
        );
      }

      return c.json({
        success: true,
        message: `Successfully disconnected ${type} provider`,
        data: { provider: type },
      });
    }
  )
  .route("/slack", slackRoutes)
  .route("/teams", teamsRoutes)
  .route("/discord", discordRoutes);

export default app;
