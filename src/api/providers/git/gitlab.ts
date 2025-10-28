// GitLab provider API routes - following GitHub pattern

import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import {
  getUserGitProvider,
  upsertGitProvider,
} from "@/lib/database/queries/providers";
import { NewGitProvider } from "@/lib/database/schema";
import { createErrorResponse } from "@/lib/errors/api-error";
import {
  getGitLabAuthUrl,
  exchangeGitLabToken,
  getGitLabProjects,
} from "@/lib/gitlab";
import { OAuthStateManager } from "@/lib/redis/oauth-state";
import {
  GitLabAuthUrlSchema,
  GitLabTokenExchangeSchema,
  ManualTokenSchema,
} from "@/lib/validation/provider-schemas";

const app = new Hono()
  .post(
    "/auth-url",
    arktypeValidator("json", GitLabAuthUrlSchema),
    async (c) => {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

      const state = await OAuthStateManager.generateState(
        userId.toString(),
        body.redirectUri
      );
      const authUrl = getGitLabAuthUrl(state, body.redirectUri, body.scopes);

      return c.json({ success: true, authUrl, state });
    }
  )
  .post(
    "/exchange-token",
    arktypeValidator("json", GitLabTokenExchangeSchema),
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

      const tokenResponse = await exchangeGitLabToken(
        body.code,
        body.redirectUri
      );

      const providerData: NewGitProvider = {
        userId,
        provider: "gitlab" as const,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || null,
        expiresAt: tokenResponse.expiresIn
          ? new Date(Date.now() + tokenResponse.expiresIn * 1000)
          : null,
      };

      const savedProvider = await upsertGitProvider(providerData);

      return c.json({
        success: true,
        message: "Successfully connected to GitLab",
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        scope: tokenResponse.scope,
        tokenType: tokenResponse.tokenType,
        provider: {
          id: savedProvider.id,
          provider: savedProvider.provider,
          connected: true,
          connectedAt: savedProvider.createdAt?.toISOString(),
        },
      });
    }
  )
  .post(
    "/connect-manual",
    arktypeValidator("json", ManualTokenSchema),
    async (c) => {
      const { accessToken } = c.req.valid("json");
      const userId = getCurrentUserId(c);

      // Validate the token by making a test API call
      const testResponse = await fetch(`https://gitlab.com/api/v4/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "git-messaging-scheduler/1.0",
        },
      });

      if (!testResponse.ok) {
        return c.json(
          {
            success: false,
            error: "Invalid token",
            message: "The provided access token is invalid or expired",
          },
          401
        );
      }

      const providerData = {
        userId,
        provider: "gitlab" as const,
        accessToken: accessToken,
        refreshToken: null,
        expiresAt: null,
      };

      const savedProvider = await upsertGitProvider(providerData);

      return c.json({
        success: true,
        message: "Successfully connected to GitLab",
        provider: {
          id: savedProvider.id,
          provider: savedProvider.provider,
          connected: true,
          connectedAt: savedProvider.createdAt?.toISOString(),
        },
      });
    }
  )
  .get("/repositories", async (c) => {
    const userId = getCurrentUserId(c);

    const gitProvider = await getUserGitProvider(userId, "gitlab");

    if (!gitProvider) {
      return createErrorResponse(
        c,
        404,
        "GitLab is not connected",
        "GitLab is not connected"
      );
    }

    const repositories = await getGitLabProjects(gitProvider.accessToken);

    return c.json({
      success: true,
      message: "Repositories fetched successfully",
      data: { repositories },
    });
  });

export default app;
