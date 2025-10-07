// Slack messaging provider API routes

import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import { createErrorResponse } from "@/lib/errors/api-error";
import { OAuthStateManager } from "@/lib/redis/oauth-state";

import { checkMessagingProviderLimits } from "../../../lib/access-control/middleware";
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
  ManualTokenSchema,
} from "../../../lib/validation/provider-schemas";

const app = new Hono()
  // Generate Slack OAuth authorization URL
  .post(
    "/auth-url",
    arktypeValidator("json", SlackAuthUrlSchema),
    async (c) => {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

      const state = await OAuthStateManager.generateState(
        userId.toString(),
        body.redirectUri
      );
      const authUrl = getSlackAuthUrl(state, body.redirectUri, body.scopes);

      return c.json({ success: true, authUrl, state });
    }
  )
  // Exchange authorization code for access token
  .post(
    "/exchange-token",
    arktypeValidator("json", SlackTokenExchangeSchema),
    async (c) => {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

      // Validate OAuth state to prevent CSRF attacks
      const stateData = await OAuthStateManager.validateAndConsumeState(
        body.state,
        userId.toString()
      );

      if (!stateData) {
        return createErrorResponse(
          c,
          400,
          "OAuth state validation failed. This may be a CSRF attack or an expired/invalid state.",
          "Invalid state."
        );
      }

      // Check tier limits before creating provider
      await checkMessagingProviderLimits(userId);

      const tokenResponse = await exchangeSlackToken(
        body.code,
        body.redirectUri
      );

      const providerData = {
        userId,
        provider: "slack" as const,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || null,
        expiresAt: tokenResponse.expiresAt || null,
      };

      const savedProvider = await upsertMessagingProvider(providerData);

      const channels = await getSlackChannels(tokenResponse.accessToken);

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
    }
  )
  // Manual token connection (for testing or direct token input)
  .post(
    "/connect-manual",
    arktypeValidator("json", ManualTokenSchema),
    async (c) => {
      const { accessToken } = c.req.valid("json");
      const userId = getCurrentUserId(c);

      // Check tier limits before creating provider
      await checkMessagingProviderLimits(userId);

      // Validate the token by making a test API call
      const isValid = await validateSlackToken(accessToken);
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
    }
  )
  // Get available channels for the user
  .get("/channels", async (c) => {
    const userId = getCurrentUserId(c);

    // Get the user's Slack provider connection
    const messagingProvider = await getUserMessagingProvider(userId, "slack");

    if (!messagingProvider) {
      return createErrorResponse(
        c,
        404,
        "Slack is not connected",
        "Slack is not connected"
      );
    }

    const channels = await getSlackChannels(messagingProvider.accessToken);

    return c.json({
      success: true,
      message: "Channels fetched successfully",
      data: { channels },
    });
  })
  // Send message to Slack channel
  .post(
    "/send-message",
    arktypeValidator("json", SlackSendMessageSchema),
    async (c) => {
      const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json(
          {
            success: false,
            error: "Missing token",
            message: "Authorization header with Bearer token required",
          },
          401
        );
      }

      const body = c.req.valid("json");
      const token = authHeader.substring(7);

      await sendSlackMessage(token, body.channel, {
        channel: body.channel,
        text: body.message,
      });

      return c.json({
        success: true,
        message: "Message sent successfully",
        data: {
          channel: body.channel,
          message: body.message,
        },
      });
    }
  )
  // Test channel by sending a test message
  .post("/test-channel", async (c) => {
    const userId = getCurrentUserId(c);
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

    // Get the user's Slack provider connection
    const messagingProvider = await getUserMessagingProvider(userId, "slack");

    if (!messagingProvider) {
      return createErrorResponse(
        c,
        404,
        "Provider not connected",
        "Slack provider is not connected"
      );
    }

    await sendSlackMessage(messagingProvider.accessToken, body.channelId, {
      channel: body.channelId,
      text: body.message,
    });

    return c.json({
      success: true,
      message: "Test message sent successfully",
      data: {
        channelId: body.channelId,
        message: body.message,
      },
    });
  })
  // Get user info
  .get("/user", async (c) => {
    const userId = getCurrentUserId(c);

    // Get the user's Slack provider connection
    const messagingProvider = await getUserMessagingProvider(userId, "slack");

    if (!messagingProvider) {
      return c.json(
        {
          success: false,
          error: "Slack is not connected",
          message: "Slack is not connected for this user",
        },
        404
      );
    }

    const userInfo = await getSlackUserInfo(messagingProvider.accessToken);

    return c.json({
      success: true,
      message: "User information fetched successfully",
      data: userInfo,
    });
  });

export default app;
export type SlackApiType = typeof app;
