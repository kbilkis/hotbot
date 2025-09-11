import { Hono } from "hono";

const app = new Hono();

// GET /api/cron-jobs - List all cron jobs
app.get("/", (c) => {
  return c.json({
    jobs: [
      {
        id: 1,
        name: "Daily PR Reminder",
        schedule: "0 9 * * 1-5",
        enabled: true,
        gitProvider: "github",
        messagingProvider: "slack",
        lastRun: "2024-01-15T09:00:00Z",
      },
    ],
  });
});

// POST /api/cron-jobs - Create a new cron job
app.post("/", async (c) => {
  const body = await c.req.json();
  return c.json(
    {
      message: "Cron job created successfully",
      job: {
        id: Date.now(),
        ...body,
        enabled: true,
        lastRun: null,
      },
    },
    201
  );
});

// PUT /api/cron-jobs/:id - Update a cron job
app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  return c.json({
    message: `Cron job ${id} updated successfully`,
    job: { id: parseInt(id), ...body },
  });
});

// DELETE /api/cron-jobs/:id - Delete a cron job
app.delete("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({
    message: `Cron job ${id} deleted successfully`,
  });
});

// POST /api/cron-jobs/:id/toggle - Enable/disable a cron job
app.post("/:id/toggle", (c) => {
  const id = c.req.param("id");
  return c.json({
    message: `Cron job ${id} toggled successfully`,
  });
});

export default app;
