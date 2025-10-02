// Discord messaging provider API routes

import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";

import {
  checkMessagingProviderLimits,
  handleTierLimitError,
} from "../../../lib/access-control/middleware";
import {
  getUserMessagingProvider,
  getUserMessagingProviders,
  upsertMessagingProvider,
} from "../../../lib/database/queries/providers";
import {
  getDiscordAuthUrl,
  exchangeDiscordToken,
  getDiscordChannels,
  sendDiscordMessage,
  sendDiscordChannelMessage,
  validateDiscordToken,
  getDiscordUserInfo,
  getBotGuilds,
} from "../../../lib/discord";
import { OAuthStateManager } from "../../../lib/redis/oauth-state";
import {
  DiscordAuthUrlSchema,
  DiscordTokenExchangeSchema,
  ManualTokenSchema,
} from "../../../lib/validation/provider-schemas";

const app = new Hono()
  // Generate Discord OAuth authorization URL
  .post(
    "/auth-url",
    arktypeValidator("json", DiscordAuthUrlSchema),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const userId = getCurrentUserId(c);

        const state = await OAuthStateManager.generateState(
          userId.toString(),
          body.redirectUri
        );
        const authUrl = getDiscordAuthUrl(
          state,
          body.redirectUri,
          body.scopes,
          body.permissions
        );

        return c.json({ success: true, authUrl, state });
      } catch (error) {
        console.error("Discord auth URL generation failed:", error);
        return c.json(
          {
            success: false,
            error: "Internal server error",
            message: "Failed to generate authorization URL",
          },
          500
        );
      }
    }
  )
  // Exchange authorization code for access token
  .post(
    "/exchange-token",
    arktypeValidator("json", DiscordTokenExchangeSchema),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const userId = getCurrentUserId(c);

        // Validate OAuth state to prevent CSRF attacks
        const stateData = await OAuthStateManager.validateAndConsumeState(
          body.state,
          userId.toString()
        );

        if (!stateData) {
          return c.json(
            {
              success: false,
              error: "Invalid state",
              message:
                "OAuth state validation failed. This may be a CSRF attack or an expired/invalid state.",
            },
            400
          );
        }

        // Check tier limits before creating provider
        await checkMessagingProviderLimits(userId);

        // Step 1: Exchange code for token with Discord
        const tokenResponse = await exchangeDiscordToken(
          body.code,
          body.redirectUri
        );

        // Step 2: Store token and guild info in database
        const providerData = {
          userId,
          provider: "discord" as const,
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken || null,
          expiresAt: tokenResponse.expiresAt || null,
          guildId: tokenResponse.guildId || null,
          guildName: tokenResponse.guildName || null,
        };

        const savedProvider = await upsertMessagingProvider(providerData);

        // Step 3: Get channels for the connected guild (if available)
        let channels: unknown[] = [];
        if (tokenResponse.guildId) {
          try {
            channels = await getDiscordChannels(tokenResponse.guildId);
          } catch (error) {
            console.warn("Failed to fetch channels:", error);
            // Don't fail the connection if we can't fetch channels
          }
        }

        // Step 4: Return success with provider data
        return c.json({
          success: true,
          message: "Successfully connected to Discord",
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          expiresAt: tokenResponse.expiresAt?.toISOString(),
          scope: tokenResponse.scope,
          tokenType: tokenResponse.tokenType,
          guild: tokenResponse.guildId
            ? {
                id: tokenResponse.guildId,
                name: tokenResponse.guildName,
              }
            : null,
          channels: channels,
          provider: {
            id: savedProvider.id,
            provider: savedProvider.provider,
            connected: true,
            connectedAt: savedProvider.createdAt?.toISOString(),
            guildId: savedProvider.guildId,
            guildName: savedProvider.guildName,
          },
        });
      } catch (error) {
        console.error("Discord token exchange failed:", error);
        return (
          handleTierLimitError(error, c) ||
          c.json(
            {
              success: false,
              error: "Token exchange failed",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to exchange authorization code",
            },
            500
          )
        );
      }
    }
  )
  // Manual token connection (for bot tokens)
  .post(
    "/connect-manual",
    arktypeValidator("json", ManualTokenSchema),
    async (c) => {
      try {
        const { accessToken } = c.req.valid("json");
        const userId = getCurrentUserId(c);

        // Check tier limits before creating provider
        await checkMessagingProviderLimits(userId);

        // Validate the token by making a test API call
        const isValid = await validateDiscordToken(accessToken);
        if (!isValid) {
          return c.json(
            {
              success: false,
              error: "Invalid token",
              message: "The provided access token is invalid or expired",
            },
            401
          );
        }

        // Get user info and bot guilds
        const [userInfo, botGuilds] = await Promise.all([
          getDiscordUserInfo(accessToken),
          getBotGuilds(),
        ]);

        // For manual bot token connections, we don't associate with a specific guild
        // The user will select guilds when creating cron jobs
        const providerData = {
          userId,
          provider: "discord" as const,
          accessToken: accessToken,
          refreshToken: null,
          expiresAt: null,
          guildId: null, // Bot token connections aren't tied to specific guilds
          guildName: null,
        };

        const savedProvider = await upsertMessagingProvider(providerData);

        return c.json({
          success: true,
          message: "Successfully connected to Discord",
          userInfo,
          guilds: botGuilds,
          provider: {
            id: savedProvider.id,
            provider: savedProvider.provider,
            connected: true,
            connectedAt: savedProvider.createdAt?.toISOString(),
          },
        });
      } catch (error) {
        console.error("Discord manual connection failed:", error);
        return (
          handleTierLimitError(error, c) ||
          c.json(
            {
              success: false,
              error: "Connection failed",
              message: "Failed to connect with provided token",
            },
            500
          )
        );
      }
    }
  )
  // Get connected guilds for the user
  .get("/guilds", async (c) => {
    try {
      const userId = getCurrentUserId(c);

      // Get all Discord provider connections for this user
      const messagingProviders = await getUserMessagingProviders(
        userId,
        "discord"
      );

      if (!messagingProviders || messagingProviders.length === 0) {
        return c.json(
          {
            success: false,
            error: "Provider not connected",
            message: "Discord provider is not connected for this user",
          },
          404
        );
      }

      // Return the connected guilds
      const guilds = messagingProviders
        .filter((provider) => provider.guildId && provider.guildName)
        .map((provider) => ({
          id: provider.guildId,
          name: provider.guildName,
          connected: true,
          connectedAt: provider.createdAt?.toISOString(),
        }));

      return c.json({
        success: true,
        message: "Connected guilds fetched successfully",
        data: { guilds },
      });
    } catch (error) {
      console.error("Discord guilds fetch failed:", error);
      return c.json(
        {
          success: false,
          error: "Guilds fetch failed",
          message:
            error instanceof Error ? error.message : "Failed to fetch guilds",
        },
        500
      );
    }
  })
  // Get channels for a specific guild
  .get("/guilds/:guildId/channels", async (c) => {
    try {
      const userId = getCurrentUserId(c);
      const guildId = c.req.param("guildId");

      // Verify the user has access to this guild
      const messagingProvider = await getUserMessagingProvider(
        userId,
        "discord",
        guildId
      );

      if (!messagingProvider) {
        return c.json(
          {
            success: false,
            error: "Guild not connected",
            message: "This Discord guild is not connected for this user",
          },
          404
        );
      }

      // Use bot token to fetch channels
      const channels = await getDiscordChannels(guildId);

      return c.json({
        success: true,
        message: "Channels fetched successfully",
        data: { channels },
      });
    } catch (error) {
      console.error("Discord channels fetch failed:", error);
      return c.json(
        {
          success: false,
          error: "Channels fetch failed",
          message:
            error instanceof Error ? error.message : "Failed to fetch channels",
        },
        500
      );
    }
  })
  // Test channel by sending a test message
  .post("/test-channel", async (c) => {
    try {
      const body = await c.req.json();

      if (!body.channelId || !body.message) {
        return c.json(
          {
            success: false,
            error: "Missing parameters",
            message: "channelId and message are required",
          },
          400
        );
      }

      // Send message using bot token to the specified channel
      await sendDiscordChannelMessage(body.channelId, {
        content: body.message,
      });

      return c.json({
        success: true,
        message: "Test message sent successfully",
        data: {
          channelId: body.channelId,
          message: body.message,
        },
      });
    } catch (error) {
      console.error("Discord test message failed:", error);
      return c.json(
        {
          success: false,
          error: "Test message failed",
          message:
            error instanceof Error
              ? error.message
              : "Failed to send test message",
        },
        500
      );
    }
  })
  // Test webhook by sending a test message
  .post("/test-webhook", async (c) => {
    try {
      const body = await c.req.json();

      if (!body.webhookUrl || !body.message) {
        return c.json(
          {
            success: false,
            error: "Missing parameters",
            message: "webhookUrl and message are required",
          },
          400
        );
      }

      await sendDiscordMessage(body.webhookUrl, {
        content: body.message,
      });

      return c.json({
        success: true,
        message: "Test message sent successfully",
        data: {
          webhookUrl: body.webhookUrl,
          message: body.message,
        },
      });
    } catch (error) {
      console.error("Discord test message failed:", error);
      return c.json(
        {
          success: false,
          error: "Test message failed",
          message:
            error instanceof Error
              ? error.message
              : "Failed to send test message",
        },
        500
      );
    }
  })
  // Get user info
  .get("/user", async (c) => {
    try {
      const userId = getCurrentUserId(c);

      // Get the user's Discord provider connection
      const messagingProvider = await getUserMessagingProvider(
        userId,
        "discord"
      );

      if (!messagingProvider) {
        return c.json(
          {
            success: false,
            error: "Provider not connected",
            message: "Discord provider is not connected for this user",
          },
          404
        );
      }

      const userInfo = await getDiscordUserInfo(messagingProvider.accessToken);

      return c.json({
        success: true,
        message: "User information fetched successfully",
        data: userInfo,
      });
    } catch (error) {
      console.error("Discord user info fetch failed:", error);
      return c.json(
        {
          success: false,
          error: "User info fetch failed",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch user information",
        },
        500
      );
    }
  });

export default app;
export type DiscordApiType = typeof app;
