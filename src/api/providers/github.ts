// GitHub provider API routes - simple functional approach

import { Hono } from "hono";
import { type } from "arktype";
import { arktypeValidator } from "@hono/arktype-validator";
import {
  GitHubAuthUrlSchema,
  GitHubTokenExchangeSchema,
  GitHubFetchPRsSchema,
  AuthUrlResponseSchema,
  TokenResponseSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
} from "../../lib/validation/provider-schemas";
import {
  getGitHubAuthUrl,
  exchangeGitHubToken,
  getGitHubRepositories,
  getGitHubPullRequests,
  getGitHubUserInfo,
  validateGitHubToken,
} from "../../lib/github";
import { getCurrentUserId } from "@/lib/auth/clerk";

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

function validateState(state: string) {
  const stateData = oauthStates.get(state);
  if (!stateData) return null;

  // Check if expired
  const now = new Date();
  if (now.getTime() - stateData.createdAt.getTime() > 10 * 60 * 1000) {
    oauthStates.delete(state);
    return null;
  }

  // Remove after validation
  oauthStates.delete(state);
  return stateData;
}

// Routes
app.post(
  "/auth-url",
  arktypeValidator("json", GitHubAuthUrlSchema),
  async (c) => {
    try {
      const body = c.req.valid("json");
      const userId = getCurrentUserId(c);

      // No need for manual validation since arktypeValidator handles it

      const state = generateState(userId.toString(), body.redirectUri);
      const authUrl = getGitHubAuthUrl(state, body.redirectUri);

      return c.json(AuthUrlResponseSchema({ authUrl, state }));
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

      const tokenResponse = await exchangeGitHubToken(
        body.code,
        body.redirectUri
      );

      return c.json(
        TokenResponseSchema({
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          expiresAt: tokenResponse.expiresAt?.toISOString(),
          scope: tokenResponse.scope,
          tokenType: tokenResponse.tokenType,
        })
      );
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

app.post("/validate-token", async (c) => {
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
    const isValid = await validateGitHubToken(token);

    return c.json(
      SuccessResponseSchema({
        success: isValid,
        message: isValid ? "Token is valid" : "Token is invalid",
        data: { valid: isValid },
      }),
      isValid ? 200 : 401
    );
  } catch (error) {
    return c.json(
      SuccessResponseSchema({
        success: false,
        message: "Token is invalid",
        data: { valid: false },
      }),
      401
    );
  }
});

app.get("/repositories", async (c) => {
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
    const repositories = await getGitHubRepositories(token);

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
