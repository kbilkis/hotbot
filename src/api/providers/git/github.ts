// GitHub provider API routes - simple functional approach

import { arktypeValidator } from "@hono/arktype-validator";
import { type } from "arktype";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import {
  getUserGitProvider,
  upsertGitProvider,
  canConnectGitHubInstallation,
} from "@/lib/database/queries/providers";
import { createErrorResponse } from "@/lib/errors/api-error";
import {
  getGitHubAuthUrl,
  exchangeGitHubToken,
  getGitHubRepositories,
  getGitHubAppInstallationDetails,
  getGitHubAppInstallationToken,
  getGitHubAppRepositoriesByInstallation,
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

    let repositories: string[];

    if (gitProvider.connectionType === "github_app") {
      if (!gitProvider.installationId) {
        return createErrorResponse(
          c,
          500,
          "Invalid GitHub App connection",
          "Missing installation ID"
        );
      }
      repositories = await getGitHubAppRepositoriesByInstallation(
        gitProvider.installationId
      );
    } else {
      repositories = await getGitHubRepositories(
        gitProvider.accessToken,
        "user_oauth"
      );
    }

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

      // SECURITY: Verify installation ownership before granting access
      // Step 1: Get installation details to verify it exists and we have access
      const installationDetails = await getGitHubAppInstallationDetails(
        installationId
      );

      // Step 2: Check if installation is already owned by another user
      const connectionCheck = await canConnectGitHubInstallation(
        userId,
        installationId
      );

      if (!connectionCheck.canConnect) {
        console.warn(
          `Security violation: User ${userId} attempted to connect installation ${installationId} already owned by user ${connectionCheck.existingOwner}`
        );
        return createErrorResponse(
          c,
          409,
          "Installation already connected",
          "This GitHub App installation is already connected to another account. Each installation can only be connected once."
        );
      }

      if (connectionCheck.reason === "already_owned") {
        console.log(
          `User ${userId} reconnecting to their own installation ${installationId}`
        );
      }

      // Step 3: Verify installation exists and we can access it
      // This will fail if the installation doesn't exist or our app isn't installed
      await getGitHubAppInstallationToken(installationId);

      // Log for security audit purposes
      console.log(
        `User ${userId} connecting to GitHub App installation ${installationId} for account ${installationDetails.account.login} (${installationDetails.account.type})`
      );

      // Store the GitHub App connection (no access token - we generate on-demand)
      const providerData = {
        userId,
        provider: "github" as const,
        connectionType: "github_app" as const,
        accessToken: "", // Placeholder - tokens are generated on-demand
        refreshToken: null,
        expiresAt: null, // No expiration for the connection itself
        installationId,
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
    }
  );

export default app;
