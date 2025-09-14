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
  upsertMessagingProvider,
} from "../../../lib/database/queries/providers";
import {
  getDiscordAuthUrl,
  exchangeDiscordToken,
  getDiscordGuilds,
  getDiscordChannels,
  sendDiscordMessage,
  validateDiscordToken,
  getDiscordUserInfo,
} from "../../../lib/discord";
import {
  DiscordAuthUrlSchema,
  DiscordTokenExchangeSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  ManualTokenSchema,
} from "../../../lib/validation/provider-schemas";

const app = new Hono();

// Simple state management (in production, use Redis or database)
const oauthStates = new Map<
  string,
  { userId: string; redirectUri: string; createdAt: Date }
>();

function generateState(userId: string, redirectUri: string): string {
  const state = crypto.randomUUID();
  oauthStates.set(state, { userId, redirectUri, createdAt: new Date() });

  // Clean up expired states (older than 10 minutes)
  const now = new Date();
  for (const [key, value] of oauthStates.entries()) {
    if (now.getTime() - value.createdAt.getTime() > 10 * 60 * 1000) {
      oauthStates.delete(key);
    }
  }

  return state;
}

// Generate Discord OAuth authorization URL
app.post(
  "/auth-url",
  arktypeValidator("json", DiscordAuthUrlSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

      const state = generateState(userId.toString(), body.redirectUri);
      const authUrl = getDiscordAuthUrl(
        state,
        body.redirectUri,
        body.scopes,
        body.permissions
      );

      return c.json({ authUrl, state });
    } catch (error) {
      console.error("Discord auth URL generation failed:", error);
      return c.json(
        ErrorResponseSchema({
          error: "Internal server error",
          message: "Failed to generate authorization URL",
        }),
        500
      );
    }
  }
);

// Exchange authorization code for access token
app.post(
  "/exchange-token",
  arktypeValidator("json", DiscordTokenExchangeSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

      // Check tier limits before creating provider
      await checkMessagingProviderLimits(userId);

      // Step 1: Exchange code for token with Discord
      const tokenResponse = await exchangeDiscordToken(
        body.code,
        body.redirectUri
      );

      // Step 2: Store token in database
      const providerData = {
        userId,
        provider: "discord" as const,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || null,
        expiresAt: tokenResponse.expiresAt || null,
      };

      const savedProvider = await upsertMessagingProvider(providerData);

      // Step 3: Get available guilds (for display purposes)
      const guilds = await getDiscordGuilds(tokenResponse.accessToken);

      // Step 4: Return success with provider data
      return c.json({
        success: true,
        message: "Successfully connected to Discord",
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        expiresAt: tokenResponse.expiresAt?.toISOString(),
        scope: tokenResponse.scope,
        tokenType: tokenResponse.tokenType,
        guilds: guilds,
        provider: {
          id: savedProvider.id,
          provider: savedProvider.provider,
          connected: true,
          connectedAt: savedProvider.createdAt?.toISOString(),
        },
      });
    } catch (error) {
      console.error("Discord token exchange failed:", error);
      return (
        handleTierLimitError(error, c) ||
        c.json(
          ErrorResponseSchema({
            error: "Token exchange failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to exchange authorization code",
          }),
          500
        )
      );
    }
  }
);

// Manual token connection (for bot tokens)
app.post(
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
          ErrorResponseSchema({
            error: "Invalid token",
            message: "The provided access token is invalid or expired",
          }),
          401
        );
      }

      // Get guilds and user info
      const [guilds, userInfo] = await Promise.all([
        getDiscordGuilds(accessToken),
        getDiscordUserInfo(accessToken),
      ]);

      const providerData = {
        userId,
        provider: "discord" as const,
        accessToken: accessToken,
        refreshToken: null,
        expiresAt: null,
      };

      const savedProvider = await upsertMessagingProvider(providerData);

      return c.json({
        success: true,
        message: "Successfully connected to Discord",
        userInfo,
        guilds,
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
          ErrorResponseSchema({
            error: "Connection failed",
            message: "Failed to connect with provided token",
          }),
          500
        )
      );
    }
  }
);

// Get available guilds for the user
app.get("/guilds", async (c) => {
  try {
    const userId = getCurrentUserId(c);

    // Get the user's Discord provider connection
    const messagingProvider = await getUserMessagingProvider(userId, "discord");

    if (!messagingProvider) {
      return c.json(
        ErrorResponseSchema({
          error: "Provider not connected",
          message: "Discord provider is not connected for this user",
        }),
        404
      );
    }
    const guilds = await getDiscordGuilds(messagingProvider.accessToken);

    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "Guilds fetched successfully",
        data: { guilds },
      })
    );
  } catch (error) {
    console.error("Discord guilds fetch failed:", error);
    return c.json(
      ErrorResponseSchema({
        error: "Guilds fetch failed",
        message:
          error instanceof Error ? error.message : "Failed to fetch guilds",
      }),
      500
    );
  }
});

// Get channels for a specific guild
app.get("/guilds/:guildId/channels", async (c) => {
  try {
    const userId = getCurrentUserId(c);
    const guildId = c.req.param("guildId");

    // Get the user's Discord provider connection
    const messagingProvider = await getUserMessagingProvider(userId, "discord");

    if (!messagingProvider) {
      return c.json(
        ErrorResponseSchema({
          error: "Provider not connected",
          message: "Discord provider is not connected for this user",
        }),
        404
      );
    }

    const channels = await getDiscordChannels(
      messagingProvider.accessToken,
      guildId
    );

    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "Channels fetched successfully",
        data: { channels },
      })
    );
  } catch (error) {
    console.error("Discord channels fetch failed:", error);
    return c.json(
      ErrorResponseSchema({
        error: "Channels fetch failed",
        message:
          error instanceof Error ? error.message : "Failed to fetch channels",
      }),
      500
    );
  }
});

// Note: /send-message removed - we use /test-webhook for testing

// Test webhook by sending a test message
app.post("/test-webhook", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.webhookUrl || !body.message) {
      return c.json(
        ErrorResponseSchema({
          error: "Missing parameters",
          message: "webhookUrl and message are required",
        }),
        400
      );
    }

    await sendDiscordMessage(body.webhookUrl, {
      content: body.message,
    });

    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "Test message sent successfully",
        data: {
          webhookUrl: body.webhookUrl,
          message: body.message,
        },
      })
    );
  } catch (error) {
    console.error("Discord test message failed:", error);
    return c.json(
      ErrorResponseSchema({
        error: "Test message failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to send test message",
      }),
      500
    );
  }
});

// Get user info
app.get("/user", async (c) => {
  try {
    const userId = getCurrentUserId(c);

    // Get the user's Discord provider connection
    const messagingProvider = await getUserMessagingProvider(userId, "discord");

    if (!messagingProvider) {
      return c.json(
        ErrorResponseSchema({
          error: "Provider not connected",
          message: "Discord provider is not connected for this user",
        }),
        404
      );
    }

    const userInfo = await getDiscordUserInfo(messagingProvider.accessToken);

    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "User information fetched successfully",
        data: userInfo,
      })
    );
  } catch (error) {
    console.error("Discord user info fetch failed:", error);
    return c.json(
      ErrorResponseSchema({
        error: "User info fetch failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch user information",
      }),
      500
    );
  }
});

export default app;
