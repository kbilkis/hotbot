// GitHub provider API routes - simple functional approach

import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";

import {
  checkGitProviderLimits,
  handleTierLimitError,
} from "../../../lib/access-control/middleware";
import {
  getUserGitProvider,
  upsertGitProvider,
} from "../../../lib/database/queries/providers";
import {
  getGitHubAuthUrl,
  exchangeGitHubToken,
  getGitHubRepositories,
  getGitHubPullRequests,
  getGitHubUserInfo,
} from "../../../lib/github";
import { OAuthStateManager } from "../../../lib/redis/oauth-state";
import {
  GitHubAuthUrlSchema,
  GitHubTokenExchangeSchema,
  GitHubFetchPRsSchema,
  ManualTokenSchema,
} from "../../../lib/validation/provider-schemas";

const app = new Hono()
  .post(
    "/auth-url",
    arktypeValidator("json", GitHubAuthUrlSchema),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const userId = getCurrentUserId(c);

        const state = await OAuthStateManager.generateState(
          userId.toString(),
          body.redirectUri
        );
        const authUrl = getGitHubAuthUrl(state, body.redirectUri, body.scopes);

        return c.json({ success: true, authUrl, state });
      } catch (error) {
        console.error("GitHub auth URL generation failed:", error);
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
    arktypeValidator("json", GitHubTokenExchangeSchema),
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

        // Step 1: Exchange code for token with GitHub
        const tokenResponse = await exchangeGitHubToken(
          body.code,
          body.redirectUri
        );

        const providerData = {
          userId,
          provider: "github" as const,
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken || null,
          repositories: null, // Will be set later in schedule configuration
        };

        const savedProvider = await upsertGitProvider(providerData);

        // Step 3: Return success with provider data
        return c.json({
          success: true,
          message: "Successfully connected to GitHub",
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
        console.error("GitHub token exchange failed:", error);
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
        const testResponse = await fetch("https://api.github.com/user", {
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
          provider: "github" as const,
          accessToken: accessToken,
          refreshToken: null,
          expiresAt: null,
          repositories: null,
        };

        const savedProvider = await upsertGitProvider(providerData);

        return c.json({
          success: true,
          message: "Successfully connected to GitHub",
          provider: {
            id: savedProvider.id,
            provider: savedProvider.provider,
            connected: true,
            connectedAt: savedProvider.createdAt?.toISOString(),
          },
        });
      } catch (error) {
        console.error("GitHub manual connection failed:", error);
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

      const gitProvider = await getUserGitProvider(userId, "github");

      if (!gitProvider) {
        return c.json(
          {
            success: false,
            error: "Provider not connected",
            message: "GitHub provider is not connected for this user",
          },
          404
        );
      }

      const repositories = await getGitHubRepositories(gitProvider.accessToken);

      return c.json({
        success: true,
        message: "Repositories fetched successfully",
        data: { repositories },
      });
    } catch (error) {
      console.error("GitHub repositories fetch failed:", error);
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
    "/pull-requests",
    arktypeValidator("json", GitHubFetchPRsSchema),
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
        const pullRequests = await getGitHubPullRequests(
          token,
          body.repositories,
          body.filters
        );

        return c.json({
          success: true,
          message: "Pull requests fetched successfully",
          data: {
            pullRequests,
            count: pullRequests.length,
          },
        });
      } catch (error) {
        console.error("GitHub pull requests fetch failed:", error);
        return c.json(
          {
            success: false,
            error: "Pull requests fetch failed",
            message:
              error instanceof Error
                ? error.message
                : "Failed to fetch pull requests",
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
      const userInfo = await getGitHubUserInfo(token);

      return c.json({
        success: true,
        message: "User information fetched successfully",
        data: userInfo,
      });
    } catch (error) {
      console.error("GitHub user info fetch failed:", error);
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
export type GithubApiType = typeof app;
