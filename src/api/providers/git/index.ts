import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "../../../lib/auth/clerk";
import {
  getUserGitProviders,
  deleteGitProvider,
} from "../../../lib/database/queries/providers";
import { GitProviderQuerySchema } from "../../../lib/validation/provider-schemas";

import githubRoutes from "./github";
import gitlabRoutes from "./gitlab";

const app = new Hono()
  .route("/github", githubRoutes)
  .route("/gitlab", gitlabRoutes)
  // GET /api/providers/git - List all git providers for the current user
  .get("/", async (c) => {
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
      const providers = allProviders.map((provider, idx) => {
        const connected = connectedMap.get(provider.type);
        return {
          id: connected?.id || idx.toString(),
          provider: provider.type,
          name: provider.name,
          connected: !!connected,
          connectedAt: connected?.createdAt?.toISOString(),
          repositories: connected?.repositories || [],
        };
      });

      return c.json({
        success: true,
        message: "Git providers fetched successfully",
        data: { providers },
      });
    } catch (error) {
      console.error("Failed to fetch git providers:", error);

      return c.json(
        {
          success: false,
          error: "Fetch failed",
          message: "Failed to fetch git provider status",
        },
        500
      );
    }
  })
  // DELETE /api/providers/git - Disconnect git provider
  .delete("/", arktypeValidator("query", GitProviderQuerySchema), async (c) => {
    try {
      const { type } = c.req.valid("query");
      const userId = getCurrentUserId(c);

      // Delete the provider connection from database
      const deleted = await deleteGitProvider(userId, type);

      if (!deleted) {
        return c.json(
          {
            success: false,
            error: "Provider not found",
            message: `No connection found for ${type}`,
          },
          404
        );
      }

      return c.json({
        success: true,
        message: `Successfully disconnected from ${type}`,
        data: {
          providers: [],
        },
      });
    } catch (error) {
      console.error("Git provider disconnection failed:", error);

      return c.json(
        {
          success: false,
          error: "Disconnection failed",
          message: "Failed to disconnect git provider",
        },
        500
      );
    }
  });

export default app;
export type GitRoutesApiType = typeof app;
