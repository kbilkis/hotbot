// GitLab provider API routes - following GitHub pattern

import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import { NewGitProvider } from "@/lib/database/schema";

import {
  checkGitProviderLimits,
  handleTierLimitError,
} from "../../../lib/access-control/middleware";
import {
  getUserGitProvider,
  upsertGitProvider,
} from "../../../lib/database/queries/providers";
import {
  getGitLabAuthUrl,
  exchangeGitLabToken,
  getGitLabProjects,
  getGitLabMergeRequests,
  getGitLabUserInfo,
} from "../../../lib/gitlab";
import { OAuthStateManager } from "../../../lib/redis/oauth-state";
import {
  GitLabAuthUrlSchema,
  GitLabTokenExchangeSchema,
  GitLabFetchMRsSchema,
  ManualTokenSchema,
} from "../../../lib/validation/provider-schemas";

const app = new Hono()
  .post(
    "/auth-url",
    arktypeValidator("json", GitLabAuthUrlSchema),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const userId = getCurrentUserId(c);

        const state = await OAuthStateManager.generateState(
          userId.toString(),
          body.redirectUri
        );
        const authUrl = getGitLabAuthUrl(state, body.redirectUri, body.scopes);

        return c.json({ success: true, authUrl, state });
      } catch (error) {
        console.error("GitLab auth URL generation failed:", error);
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
  .post(
    "/exchange-token",
    arktypeValidator("json", GitLabTokenExchangeSchema),
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
        await checkGitProviderLimits(userId);

        // Step 1: Exchange code for token with GitLab
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
          repositories: null, // Will be set later in schedule configuration
        };

        const savedProvider = await upsertGitProvider(providerData);

        // Step 3: Return success with provider data
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
      } catch (error) {
        console.error("GitLab token exchange failed:", error);
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
  .post(
    "/connect-manual",
    arktypeValidator("json", ManualTokenSchema),
    async (c) => {
      try {
        const { accessToken } = c.req.valid("json");
        const userId = getCurrentUserId(c);

        // Check tier limits before creating provider
        await checkGitProviderLimits(userId);

        // Validate the token by making a test API call
        const gitlabBaseUrl =
          process.env.GITLAB_BASE_URL || "https://gitlab.com";
        const testResponse = await fetch(`${gitlabBaseUrl}/api/v4/user`, {
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
          repositories: null,
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
      } catch (error) {
        console.error("GitLab manual connection failed:", error);
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
  .get("/repositories", async (c) => {
    try {
      const userId = getCurrentUserId(c);

      const gitProvider = await getUserGitProvider(userId, "gitlab");

      if (!gitProvider) {
        return c.json(
          {
            success: false,
            error: "Provider not connected",
            message: "GitLab provider is not connected for this user",
          },
          404
        );
      }

      const repositories = await getGitLabProjects(gitProvider.accessToken);

      return c.json({
        success: true,
        message: "Repositories fetched successfully",
        data: { repositories },
      });
    } catch (error) {
      console.error("GitLab repositories fetch failed:", error);
      return c.json(
        {
          success: false,
          error: "Repositories fetch failed",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch repositories",
        },
        500
      );
    }
  })
  .post(
    "/merge-requests",
    arktypeValidator("json", GitLabFetchMRsSchema),
    async (c) => {
      try {
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
        const mergeRequests = await getGitLabMergeRequests(
          token,
          body.repositories,
          body.filters
        );

        return c.json({
          success: true,
          message: "Merge requests fetched successfully",
          data: {
            mergeRequests,
            count: mergeRequests.length,
          },
        });
      } catch (error) {
        console.error("GitLab merge requests fetch failed:", error);
        return c.json(
          {
            success: false,
            error: "Merge requests fetch failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to fetch merge requests",
          },
          500
        );
      }
    }
  )
  .get("/user", async (c) => {
    try {
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

      const token = authHeader.substring(7);
      const userInfo = await getGitLabUserInfo(token);

      return c.json({
        success: true,
        message: "User information fetched successfully",
        data: userInfo,
      });
    } catch (error) {
      console.error("GitLab user info fetch failed:", error);
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
export type GitlabApiType = typeof app;
