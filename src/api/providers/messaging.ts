import { Hono } from "hono";
import { type } from "arktype";
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
} from "../../lib/validation/provider-schemas";

const app = new Hono();

// Messaging provider type schema
const MessagingProviderTypeSchema = type("'slack'|'teams'|'discord'");

// GET /api/providers/messaging - List all messaging providers
app.get("/", async (c) => {
  try {
    // TODO: Get actual connection status from database
    const messagingProviders = [
      { id: 4, type: "slack", name: "Slack", connected: false },
      { id: 5, type: "teams", name: "Microsoft Teams", connected: false },
      { id: 6, type: "discord", name: "Discord", connected: false },
    ];

    const response = SuccessResponseSchema({
      success: true,
      message: "Messaging providers fetched successfully",
      data: { providers: messagingProviders },
    });

    return c.json(response);
  } catch (error) {
    console.error("Failed to fetch messaging providers:", error);

    return c.json(
      ErrorResponseSchema({
        error: "Fetch failed",
        message: "Failed to fetch messaging provider status",
      }),
      500
    );
  }
});

// POST /api/providers/messaging/:type/connect - Connect messaging provider
app.post("/:type/connect", async (c) => {
  try {
    const type = c.req.param("type");
    const validation = MessagingProviderTypeSchema(type);

    if (validation instanceof type.errors) {
      return c.json(
        ErrorResponseSchema({
          error: "Invalid messaging provider",
          message: `Unsupported messaging provider type: ${type}`,
        }),
        400
      );
    }

    const authUrls: Record<string, string> = {
      slack: "/api/providers/messaging/slack/auth-url",
      teams: "/api/providers/messaging/teams/auth-url",
      discord: "/api/providers/messaging/discord/auth-url",
    };

    const authUrl = authUrls[validation];
    if (!authUrl) {
      return c.json(
        ErrorResponseSchema({
          error: "Provider not implemented",
          message: `Messaging provider ${validation} is not yet implemented`,
        }),
        501
      );
    }

    const response = SuccessResponseSchema({
      success: true,
      message: `Initiating connection to ${validation}`,
      data: {
        provider: validation,
        authEndpoint: authUrl,
      },
    });

    return c.json(response);
  } catch (error) {
    console.error("Messaging provider connection failed:", error);

    return c.json(
      ErrorResponseSchema({
        error: "Connection failed",
        message: "Failed to initiate messaging provider connection",
      }),
      500
    );
  }
});

export default app;
