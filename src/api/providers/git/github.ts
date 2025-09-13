// GitHub provider API routes - simple functional approach

import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";

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
import {
  GitHubAuthUrlSchema,
  GitHubTokenExchangeSchema,
  GitHubFetchPRsSchema,
  ManualTokenSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
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

// Routes
app.post(
  "/auth-url",
  arktypeValidator("json", GitHubAuthUrlSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

      const state = generateState(userId.toString(), body.redirectUri);
      const authUrl = getGitHubAuthUrl(state, body.redirectUri, body.scopes);

      return c.json({ authUrl, state });
    } catch (error) {
      console.error("GitHub auth URL generation failed:", error);
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

app.post(
  "/exchange-token",
  arktypeValidator("json", GitHubTokenExchangeSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

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
      return c.json(
        ErrorResponseSchema({
          error: "Token exchange failed",
          message:
            error instanceof Error
              ? error.message
              : "Failed to exchange authorization code",
        }),
        500
      );
    }
  }
);

app.post(
  "/connect-manual",
  arktypeValidator("json", ManualTokenSchema),
  async (c) => {
    try {
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
        return c.json(
          ErrorResponseSchema({
            error: "Invalid token",
            message: "The provided access token is invalid or expired",
          }),
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
      return c.json(
        ErrorResponseSchema({
          error: "Connection failed",
          message: "Failed to connect with provided token",
        }),
        500
      );
    }
  }
);

app.get("/repositories", async (c) => {
  try {
    const userId = getCurrentUserId(c);

    const gitProvider = await getUserGitProvider(userId, "github");

    if (!gitProvider) {
      return c.json(
        ErrorResponseSchema({
          error: "Provider not connected",
          message: "GitHub provider is not connected for this user",
        }),
        404
      );
    }

    const repositories = await getGitHubRepositories(gitProvider.accessToken);

    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "Repositories fetched successfully",
        data: { repositories },
      })
    );
  } catch (error) {
    console.error("GitHub repositories fetch failed:", error);
    return c.json(
      ErrorResponseSchema({
        error: "Repositories fetch failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch repositories",
      }),
      500
    );
  }
});

app.post(
  "/pull-requests",
  arktypeValidator("json", GitHubFetchPRsSchema),
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
      const pullRequests = await getGitHubPullRequests(
        token,
        body.repositories,
        body.filters
      );

      return c.json(
        SuccessResponseSchema({
          success: true,
          message: "Pull requests fetched successfully",
          data: {
            pullRequests,
            count: pullRequests.length,
          },
        })
      );
    } catch (error) {
      console.error("GitHub pull requests fetch failed:", error);
      return c.json(
        ErrorResponseSchema({
          error: "Pull requests fetch failed",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch pull requests",
        }),
        500
      );
    }
  }
);

app.get("/user", async (c) => {
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

    const token = authHeader.substring(7);
    const userInfo = await getGitHubUserInfo(token);

    return c.json(
      SuccessResponseSchema({
        success: true,
        message: "User information fetched successfully",
        data: userInfo,
      })
    );
  } catch (error) {
    console.error("GitHub user info fetch failed:", error);
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
