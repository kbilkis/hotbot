import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import { MessagingProvider } from "@/lib/database/schema";

import {
  deleteMessagingProvider,
  getUserMessagingProviders,
} from "../../../lib/database/queries/providers";
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
  MessagingProviderQuerySchema,
} from "../../../lib/validation/provider-schemas";

import discordRoutes from "./discord";
import slackRoutes from "./slack";
import teamsRoutes from "./teams";

const app = new Hono();

export interface MessagingProviderDTO {
  id: string | null;
  type: string;
  name: string;
  connected: boolean;
  connectedAt?: string;
  providerId?: string;
}

// GET /api/providers/messaging - List all messaging providers
app.get("/", async (c) => {
  try {
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
      {
        id: providersByType.slack?.id || null,
        type: "slack",
        name: "Slack",
        connected: !!providersByType.slack,
        connectedAt: providersByType.slack?.createdAt?.toISOString(),
      },
      {
        id: providersByType.teams?.id || null,
        type: "teams",
        name: "Microsoft Teams",
        connected: !!providersByType.teams,
        connectedAt: providersByType.teams?.createdAt?.toISOString(),
      },
      // For Discord, include all connected guilds as separate providers
      ...discordProviders.map((provider) => ({
        id: provider.id,
        type: "discord",
        name: provider.guildName
          ? `Discord - ${provider.guildName}`
          : "Discord",
        connected: true,
        connectedAt: provider.createdAt?.toISOString(),
        guildId: provider.guildId,
        guildName: provider.guildName,
      })),
      // If no Discord providers are connected, show the default entry
      ...(discordProviders.length === 0
        ? [
            {
              id: null,
              type: "discord",
              name: "Discord",
              connected: false,
              connectedAt: undefined,
            },
          ]
        : []),
    ];

    const response = SuccessResponseSchema({
      success: true,
      message: "Messaging providers fetched successfully",
      data: { providers: messagingProviders },
    });

    return c.json(response);
  } catch (error) {
    console.error("Failed to fetch messaging providers:", error);

    return c.json(
      ErrorResponseSchema({
        error: "Fetch failed",
        message: "Failed to fetch messaging provider status",
      }),
      500
    );
  }
});

// DELETE /api/providers/messaging - Disconnect messaging provider
app.delete(
  "/",
  arktypeValidator("query", MessagingProviderQuerySchema),
  async (c) => {
    try {
      const { type } = c.req.valid("query");
      const userId = getCurrentUserId(c);

      const deleted = await deleteMessagingProvider(userId, type);

      if (!deleted) {
        return c.json(
          ErrorResponseSchema({
            error: "Provider not found",
            message: `No ${type} provider connection found for this user`,
          }),
          404
        );
      }

      return c.json(
        SuccessResponseSchema({
          success: true,
          message: `Successfully disconnected ${type} provider`,
          data: { provider: type },
        })
      );
    } catch (error) {
      console.error("Messaging provider disconnect failed:", error);

      return c.json(
        ErrorResponseSchema({
          error: "Disconnect failed",
          message: "Failed to disconnect messaging provider",
        }),
        500
      );
    }
  }
);

// Mount provider routes
app.route("/slack", slackRoutes);
app.route("/teams", teamsRoutes);
app.route("/discord", discordRoutes);

export default app;
