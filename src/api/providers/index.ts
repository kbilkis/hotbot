import { Hono } from "hono";
import {
  ErrorResponseSchema,
  SuccessResponseSchema,
} from "../../lib/validation/provider-schemas";
import gitRoutes from "./git";
import messagingRoutes from "./messaging";

const app = new Hono();

// Mount provider category routes
app.route("/git", gitRoutes);
app.route("/messaging", messagingRoutes);

// GET /api/providers - List all providers (overview)
app.get("/", async (c) => {
  try {
    // TODO: Get actual connection status from database
    const providers = {
      git: [
        { id: 1, type: "github", name: "GitHub", connected: false },
        { id: 2, type: "gitlab", name: "GitLab", connected: false },
        { id: 3, type: "bitbucket", name: "Bitbucket", connected: false },
      ],
      messaging: [
        { id: 4, type: "slack", name: "Slack", connected: false },
        { id: 5, type: "teams", name: "Microsoft Teams", connected: false },
        { id: 6, type: "discord", name: "Discord", connected: false },
      ],
    };

    const response = SuccessResponseSchema({
      success: true,
      message: "Providers fetched successfully",
      data: { providers },
    });

    return c.json(response);
  } catch (error) {
    console.error("Failed to fetch providers:", error);

    return c.json(
      ErrorResponseSchema({
        error: "Fetch failed",
        message: "Failed to fetch provider status",
      }),
      500
    );
  }
});

// DELETE /api/providers/:id - Disconnect a provider
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
      return c.json(
        ErrorResponseSchema({
          error: "Invalid ID",
          message: "Provider ID must be a number",
        }),
        400
      );
    }

    // TODO: Implement actual provider disconnection
    // This would involve:
    // 1. Removing tokens from database
    // 2. Revoking tokens with the provider if supported
    // 3. Updating connection status

    const response = SuccessResponseSchema({
      success: true,
      message: `Provider ${providerId} disconnected successfully`,
      data: { providerId },
    });

    return c.json(response);
  } catch (error) {
    console.error("Provider disconnection failed:", error);

    return c.json(
      ErrorResponseSchema({
        error: "Disconnection failed",
        message: "Failed to disconnect provider",
      }),
      500
    );
  }
});

export default app;
