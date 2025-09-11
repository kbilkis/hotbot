import { Hono } from "hono";

const app = new Hono();

// GET /api/providers - List all connected providers
app.get("/", (c) => {
  return c.json({
    providers: [
      { id: 1, type: "github", name: "GitHub", connected: false },
      { id: 2, type: "gitlab", name: "GitLab", connected: false },
      { id: 3, type: "bitbucket", name: "Bitbucket", connected: false },
      { id: 4, type: "slack", name: "Slack", connected: false },
      { id: 5, type: "teams", name: "Microsoft Teams", connected: false },
      { id: 6, type: "discord", name: "Discord", connected: false },
    ],
  });
});

// POST /api/providers/:type/connect - Connect a provider
app.post("/:type/connect", (c) => {
  const type = c.req.param("type");
  return c.json({
    message: `Connecting to ${type}...`,
    redirectUrl: `/auth/${type}`,
  });
});

// DELETE /api/providers/:id - Disconnect a provider
app.delete("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({
    message: `Provider ${id} disconnected successfully`,
  });
});

export default app;
