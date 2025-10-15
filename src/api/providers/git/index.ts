import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";
import {
  getUserGitProviders,
  deleteGitProvider,
} from "@/lib/database/queries/providers";
import { createErrorResponse } from "@/lib/errors/api-error";
import { GitProviderQuerySchema } from "@/lib/validation/provider-schemas";

import githubRoutes from "./github";
import gitlabRoutes from "./gitlab";

const app = new Hono()
  .route("/github", githubRoutes)
  .route("/gitlab", gitlabRoutes)
  // GET /api/providers/git - List all git providers for the current user
  .get("/", async (c) => {
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
  })
  // DELETE /api/providers/git - Disconnect git provider
  .delete("/", arktypeValidator("query", GitProviderQuerySchema), async (c) => {
    const { type } = c.req.valid("query");
    const userId = getCurrentUserId(c);

    // Delete the provider connection from database
    const deleted = await deleteGitProvider(userId, type);

    if (!deleted) {
      return createErrorResponse(
        c,
        404,
        "Provider not found",
        `No connection found for ${type}`
      );
    }

    return c.json({
      success: true,
      message: `Successfully disconnected from ${type}`,
      data: {
        providers: [],
      },
    });
  });

export default app;
