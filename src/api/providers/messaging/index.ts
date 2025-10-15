import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import {
  deleteMessagingProvider,
  getUserMessagingProviders,
} from "@/lib/database/queries/providers";
import {
  MessagingProvider,
  MessagingProviderType,
} from "@/lib/database/schema";
import { createErrorResponse } from "@/lib/errors/api-error";
import { MessagingProviderQuerySchema } from "@/lib/validation/provider-schemas";

import discordRoutes from "./discord";
import slackRoutes from "./slack";
import teamsRoutes from "./teams";

interface MessagingProviderDTO {
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
              connectedAt: providersByType.slack.createdAt!.toISOString(),
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
              connectedAt: providersByType.teams.createdAt!.toISOString(),
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
        connectedAt: provider.createdAt!.toISOString(),
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
  // DELETE /api/providers/messaging - Disconnect messaging provider
  .delete(
    "/",
    arktypeValidator("query", MessagingProviderQuerySchema),
    async (c) => {
      const { type } = c.req.valid("query");
      const userId = getCurrentUserId(c);

      const deleted = await deleteMessagingProvider(userId, type);

      if (!deleted) {
        return createErrorResponse(
          c,
          404,
          "Provider not found",
          "Provider not found"
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
