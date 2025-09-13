import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "../../../lib/auth/clerk";
import {
  getUserGitProviders,
  deleteGitProvider,
} from "../../../lib/database/queries/providers";
import {
  GitProviderQuerySchema,
  ErrorResponseSchema,
} from "../../../lib/validation/provider-schemas";

import githubRoutes from "./github";

const app = new Hono();

// Mount git provider-specific routes
app.route("/github", githubRoutes);

// GET /api/providers/git - List all git providers for the current user
app.get("/", async (c) => {
  try {
    const userId = getCurrentUserId(c);

    // Get connected providers from database
    const connectedProviders = await getUserGitProviders(userId);
    // Create a map of connected providers for quick lookup
    const connectedMap = new Map(
      connectedProviders.map((p) => [p.provider, p])
    );

    // Define all available git providers
    const allProviders = [
      { type: "github" as const, name: "GitHub" },
      { type: "gitlab" as const, name: "GitLab" },
      { type: "bitbucket" as const, name: "Bitbucket" },
    ];

    // Build response with connection status
    const providers = allProviders.map((provider) => {
      const connected = connectedMap.get(provider.type);
      return {
        id: connected?.id || 0,
        provider: provider.type,
        name: provider.name,
        connected: !!connected,
        connectedAt: connected?.createdAt?.toISOString(),
        repositories: connected?.repositories || [],
      };
    });

    const responseData = {
      success: true,
      message: "Git providers fetched successfully",
      data: { providers },
    };

    return c.json(responseData);
  } catch (error) {
    console.error("Failed to fetch git providers:", error);

    const errorData = {
      error: "Fetch failed",
      message: "Failed to fetch git provider status",
    };

    const validatedError = ErrorResponseSchema(errorData);
    return c.json(validatedError, 500);
  }
});

// DELETE /api/providers/git/disconnect?type=github - Disconnect git provider
app.delete(
  "/disconnect",
  arktypeValidator("query", GitProviderQuerySchema),
  async (c) => {
    try {
      const { type } = c.req.valid("query");
      const userId = getCurrentUserId(c);

      // Delete the provider connection from database
      const deleted = await deleteGitProvider(userId, type);

      if (!deleted) {
        const errorData = {
          error: "Provider not found",
          message: `No connection found for ${type}`,
        };
        return c.json(ErrorResponseSchema(errorData), 404);
      }

      const responseData = {
        success: true,
        message: `Successfully disconnected from ${type}`,
        data: {
          providers: [],
        },
      };

      return c.json(responseData);
    } catch (error) {
      console.error("Git provider disconnection failed:", error);

      const errorData = {
        error: "Disconnection failed",
        message: "Failed to disconnect git provider",
      };
      return c.json(ErrorResponseSchema(errorData), 500);
    }
  }
);

export default app;
