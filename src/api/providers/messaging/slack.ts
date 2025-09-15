// Slack messaging provider API routes

import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import { OAuthStateManager } from "@/lib/redis/oauth-state";

import {
  checkMessagingProviderLimits,
  handleTierLimitError,
} from "../../../lib/access-control/middleware";
import {
  getUserMessagingProvider,
  upsertMessagingProvider,
} from "../../../lib/database/queries/providers";
import {
  getSlackAuthUrl,
  exchangeSlackToken,
  getSlackChannels,
  sendSlackMessage,
  validateSlackToken,
  getSlackUserInfo,
} from "../../../lib/slack";
import {
  SlackAuthUrlSchema,
  SlackTokenExchangeSchema,
  SlackSendMessageSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  ManualTokenSchema,
} from "../../../lib/validation/provider-schemas";

const app = new Hono();

// Generate Slack OAuth authorization URL
app.post(
  "/auth-url",
  arktypeValidator("json", SlackAuthUrlSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

      const state = await OAuthStateManager.generateState(
        userId.toString(),
        body.redirectUri
      );
      const authUrl = getSlackAuthUrl(state, body.redirectUri, body.scopes);

      return c.json({ authUrl, state });
    } catch (error) {
      console.error("Slack auth URL generation failed:", error);
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
  arktypeValidator("json", SlackTokenExchangeSchema),
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
          ErrorResponseSchema({
            error: "Invalid state",
            message:
              "OAuth state validation failed. This may be a CSRF attack or an expired/invalid state.",
          }),
          400
        );
      }

      // Check tier limits before creating provider
      await checkMessagingProviderLimits(userId);

      // Step 1: Exchange code for token with Slack
      const tokenResponse = await exchangeSlackToken(
        body.code,
        body.redirectUri
      );

      // Step 2: Store token in database (single provider entry)

      const providerData = {
        userId,
        provider: "slack" as const,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || null,
        expiresAt: tokenResponse.expiresAt || null,
      };

      const savedProvider = await upsertMessagingProvider(providerData);

      // Step 3: Get available channels (for display purposes)
      const channels = await getSlackChannels(tokenResponse.accessToken);

      // Step 4: Return success with provider data
      return c.json({
        success: true,
        message: "Successfully connected to Slack",
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        expiresAt: tokenResponse.expiresAt?.toISOString(),
        scope: tokenResponse.scope,
        tokenType: tokenResponse.tokenType,
        teamId: tokenResponse.teamId,
        teamName: tokenResponse.teamName,
        channels: channels,
        provider: {
          id: savedProvider.id,
          provider: savedProvider.provider,
          connected: true,
          connectedAt: savedProvider.createdAt?.toISOString(),
        },
      });
    } catch (error) {
      console.error("Slack token exchange failed:", error);
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

// Manual token connection (for testing or direct token input)
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
      const isValid = await validateSlackToken(accessToken);
      if (!isValid) {
        return c.json(
          ErrorResponseSchema({
            error: "Invalid token",
            message: "The provided access token is invalid or expired",
          }),
          401
        );
      }

      // Get channels and user info
      const [channels, userInfo] = await Promise.all([
        getSlackChannels(accessToken),
        getSlackUserInfo(accessToken),
      ]);

      const providerData = {
        userId,
        provider: "slack" as const,
        accessToken: accessToken,
        refreshToken: null,
        expiresAt: null,
      };

      const savedProvider = await upsertMessagingProvider(providerData);

      return c.json({
        success: true,
        message: "Successfully connected to Slack",
        userInfo,
        channels,
        provider: {
          id: savedProvider.id,
          provider: savedProvider.provider,
          connected: true,
          connectedAt: savedProvider.createdAt?.toISOString(),
        },
      });
    } catch (error) {
      console.error("Slack manual connection failed:", error);
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

// Get available channels for the user
app.get("/channels", async (c) => {
  try {
    const userId = getCurrentUserId(c);

    // Get the user's Slack provider connection
    const messagingProvider = await getUserMessagingProvider(userId, "slack");

    if (!messagingProvider) {
      return c.json(
        ErrorResponseSchema({
          error: "Provider not connected",
          message: "Slack provider is not connected for this user",
        }),
        404
      );
    }

    const channels = await getSlackChannels(messagingProvider.accessToken);

    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "Channels fetched successfully",
        data: { channels },
      })
    );
  } catch (error) {
    console.error("Slack channels fetch failed:", error);
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

// Send message to Slack channel
app.post(
  "/send-message",
  arktypeValidator("json", SlackSendMessageSchema),
  async (c) => {
    try {
      const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json(
          ErrorResponseSchema({
            error: "Missing token",
            message: "Authorization header with Bearer token required",
          }),
          401
        );
      }

      const body = c.req.valid("json");
      const token = authHeader.substring(7);

      await sendSlackMessage(token, body.channel, {
        channel: body.channel,
        text: body.message,
      });

      return c.json(
        SuccessResponseSchema({
          success: true,
          message: "Message sent successfully",
          data: {
            channel: body.channel,
            message: body.message,
          },
        })
      );
    } catch (error) {
      console.error("Slack message send failed:", error);
      return c.json(
        ErrorResponseSchema({
          error: "Message send failed",
          message:
            error instanceof Error ? error.message : "Failed to send message",
        }),
        500
      );
    }
  }
);

// Test channel by sending a test message
app.post("/test-channel", async (c) => {
  try {
    const userId = getCurrentUserId(c);
    const body = await c.req.json();

    if (!body.channelId || !body.message) {
      return c.json(
        ErrorResponseSchema({
          error: "Missing parameters",
          message: "channelId and message are required",
        }),
        400
      );
    }

    // Get the user's Slack provider connection
    const messagingProvider = await getUserMessagingProvider(userId, "slack");

    if (!messagingProvider) {
      return c.json(
        ErrorResponseSchema({
          error: "Provider not connected",
          message: "Slack provider is not connected for this user",
        }),
        404
      );
    }

    await sendSlackMessage(messagingProvider.accessToken, body.channelId, {
      channel: body.channelId,
      text: body.message,
    });

    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "Test message sent successfully",
        data: {
          channelId: body.channelId,
          message: body.message,
        },
      })
    );
  } catch (error) {
    console.error("Slack test message failed:", error);
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

    // Get the user's Slack provider connection
    const messagingProvider = await getUserMessagingProvider(userId, "slack");

    if (!messagingProvider) {
      return c.json(
        ErrorResponseSchema({
          error: "Provider not connected",
          message: "Slack provider is not connected for this user",
        }),
        404
      );
    }

    const userInfo = await getSlackUserInfo(messagingProvider.accessToken);

    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "User information fetched successfully",
        data: userInfo,
      })
    );
  } catch (error) {
    console.error("Slack user info fetch failed:", error);
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
