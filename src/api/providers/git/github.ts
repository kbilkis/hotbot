// GitHub provider API routes - simple functional approach

import { arktypeValidator } from "@hono/arktype-validator";
import { type } from "arktype";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import {
  getUserGitProvider,
  upsertGitProvider,
} from "@/lib/database/queries/providers";
import { createErrorResponse } from "@/lib/errors/api-error";
import {
  getGitHubAuthUrl,
  exchangeGitHubToken,
  getGitHubRepositories,
} from "@/lib/github";
import { OAuthStateManager } from "@/lib/redis/oauth-state";
import {
  GitHubAuthUrlSchema,
  GitHubTokenExchangeSchema,
  ManualTokenSchema,
} from "@/lib/validation/provider-schemas";

const app = new Hono()
  .post(
    "/auth-url",
    arktypeValidator("json", GitHubAuthUrlSchema),
    async (c) => {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

      const state = await OAuthStateManager.generateState(
        userId.toString(),
        body.redirectUri
      );
      const authUrl = getGitHubAuthUrl(state, body.redirectUri, body.scopes);

      return c.json({ success: true, authUrl, state });
    }
  )
  .post(
    "/exchange-token",
    arktypeValidator("json", GitHubTokenExchangeSchema),
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

      const tokenResponse = await exchangeGitHubToken(
        body.code,
        body.redirectUri
      );

      const providerData = {
        userId,
        provider: "github" as const,
        connectionType: "user_oauth" as const,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || null,
      };

      const savedProvider = await upsertGitProvider(providerData);

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
    }
  )
  .post(
    "/connect-manual",
    arktypeValidator("json", ManualTokenSchema),
    async (c) => {
      const { accessToken } = c.req.valid("json");
      const userId = getCurrentUserId(c);

      // Validate the token by making a test API call
      const testResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "git-messaging-scheduler/1.0",
        },
      });

      if (!testResponse.ok) {
        return c.json({
          success: false,
          error: "Connection failed",
          message: "Failed to connect with provided token",
        });
      }

      const providerData = {
        userId,
        provider: "github" as const,
        connectionType: "user_oauth" as const,
        accessToken: accessToken,
        refreshToken: null,
        expiresAt: null,
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
    }
  )
  .get("/repositories", async (c) => {
    const userId = getCurrentUserId(c);

    const gitProvider = await getUserGitProvider(userId, "github");

    if (!gitProvider) {
      return createErrorResponse(
        c,
        404,
        "GitHub is not connected",
        "GitHub is not connected"
      );
    }

    const repositories = await getGitHubRepositories(
      gitProvider.accessToken,
      gitProvider.connectionType as "user_oauth" | "github_app"
    );

    return c.json({
      success: true,
      message: "Repositories fetched successfully",
      data: { repositories },
    });
  })
  // POST /api/providers/git/github/app/connect - Connect via GitHub App installation
  .post(
    "/app/connect",
    arktypeValidator("json", type({ installationId: "string" })),
    async (c) => {
      const { installationId } = c.req.valid("json");
      const userId = getCurrentUserId(c);

      try {
        const { getGitHubAppInstallationToken } = await import("@/lib/github");

        // Get installation token
        const { token, expiresAt } = await getGitHubAppInstallationToken(
          installationId
        );

        // Store the GitHub App connection
        const providerData = {
          userId,
          provider: "github" as const,
          connectionType: "github_app" as const,
          accessToken: token,
          refreshToken: null,
          expiresAt: new Date(expiresAt),
        };

        const savedProvider = await upsertGitProvider(providerData);

        return c.json({
          success: true,
          message: "Successfully connected via GitHub App",
          provider: {
            id: savedProvider.id,
            provider: savedProvider.provider,
            connected: true,
            connectedAt: savedProvider.createdAt?.toISOString(),
            installationId,
          },
        });
      } catch (error) {
        console.error("Failed to connect GitHub App:", error);
        return createErrorResponse(
          c,
          500,
          "Failed to connect GitHub App",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  );

export default app;
