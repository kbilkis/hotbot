import { Hono } from "hono";
import { type } from "arktype";
import { arktypeValidator } from "@hono/arktype-validator";
import {
  GitProviderTypeSchema,
  GitProviderResponseSchema,
  ErrorResponseSchema,
} from "../../lib/validation/provider-schemas";
import { getCurrentUserId } from "../../lib/auth/clerk";
import { getUserGitProviders } from "../../lib/database/queries/providers";
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

// Schema for git provider connection request
const connectGitProviderSchema = type({
  "redirectUri?": "string",
});

// POST /api/providers/git/:type/connect - Connect git provider
app.post(
  "/:type/connect",
  arktypeValidator("json", connectGitProviderSchema),
  async (c) => {
    try {
      const type = c.req.param("type");
      const requestData = c.req.valid("json");
      const validation = GitProviderTypeSchema(type);

      if (!validation || typeof validation !== "string") {
        const errorData = {
          error: "Invalid git provider",
          message: `Unsupported git provider type: ${type}`,
        };
        return c.json(ErrorResponseSchema(errorData), 400);
      }

      const authUrls: Record<string, string> = {
        github: "/api/providers/git/github/auth-url",
        gitlab: "/api/providers/git/gitlab/auth-url",
        bitbucket: "/api/providers/git/bitbucket/auth-url",
      };

      const authUrl = authUrls[validation];
      if (!authUrl) {
        const errorData = {
          error: "Provider not implemented",
          message: `Git provider ${validation} is not yet implemented`,
        };
        return c.json(ErrorResponseSchema(errorData), 501);
      }

      // Create response with proper arktype validation
      const responseData = {
        success: true,
        message: `Initiating connection to ${validation}`,
        data: {
          providers: [
            {
              id: 0, // Temporary ID for connection initiation
              provider: validation,
              name: validation,
              connected: false,
              connectedAt: null,
              repositories: null,
            },
          ],
        },
      };

      const validatedResponse = GitProviderResponseSchema(responseData);
      if (validatedResponse instanceof GitProviderResponseSchema.errors) {
        console.error("Response validation failed:", validatedResponse);
        return c.json(
          ErrorResponseSchema({ error: "Internal validation error" }),
          500
        );
      }

      return c.json(validatedResponse);
    } catch (error) {
      console.error("Git provider connection failed:", error);

      const errorData = {
        error: "Connection failed",
        message: "Failed to initiate git provider connection",
      };
      return c.json(ErrorResponseSchema(errorData), 500);
    }
  }
);

export default app;
