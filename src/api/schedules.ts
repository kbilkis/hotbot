import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import { getCurrentUserId } from "@/lib/auth/clerk";

import {
  createCronJob,
  getUserCronJobs,
  getCronJobById,
  updateCronJob,
  deleteCronJob,
  toggleCronJobStatus,
} from "../lib/database/queries/cron-jobs";
import {
  CreateCronJobSchema,
  UpdateCronJobSchema,
  ToggleCronJobSchema,
  ListCronJobsQuerySchema,
} from "../lib/validation/cron-job-schemas";

const app = new Hono();

// GET /api/schedules - List all cron jobs for the authenticated user
app.get("/", arktypeValidator("query", ListCronJobsQuerySchema), async (c) => {
  try {
    const userId = getCurrentUserId(c);
    const query = c.req.valid("query");
    const jobs = await getUserCronJobs(userId);

    // Filter by active status if specified
    let filteredJobs = jobs;
    if (query.active !== undefined) {
      filteredJobs = jobs.filter((job) => job.isActive === query.active);
    }

    return c.json({
      jobs: filteredJobs,
    });
  } catch (error) {
    console.error("Error fetching cron jobs:", error);
    return c.json({ error: "Failed to fetch cron jobs" }, 500);
  }
});

// GET /api/schedules/:id - Get a specific cron job
app.get("/:id", async (c) => {
  try {
    const userId = getCurrentUserId(c);
    const id = c.req.param("id");
    const job = await getCronJobById(id, userId);

    if (!job) {
      return c.json({ error: "Cron job not found" }, 404);
    }

    return c.json({ job });
  } catch (error) {
    console.error("Error fetching cron job:", error);
    return c.json({ error: "Failed to fetch cron job" }, 500);
  }
});

// POST /api/schedules - Create a new cron job
app.post("/", arktypeValidator("json", CreateCronJobSchema), async (c) => {
  try {
    const userId = getCurrentUserId(c);
    const jobData = c.req.valid("json");

    // Create the cron job
    const job = await createCronJob(userId, jobData);

    return c.json(
      {
        message: "Cron job created successfully",
        job,
      },
      201
    );
  } catch (error) {
    console.error("Error creating cron job:", error);
    return c.json({ error: "Failed to create cron job" }, 500);
  }
});

// PUT /api/schedules/:id - Update a cron job
app.put("/:id", arktypeValidator("json", UpdateCronJobSchema), async (c) => {
  try {
    const userId = getCurrentUserId(c);
    const id = c.req.param("id");
    const updateData = c.req.valid("json");

    // Verify the ID matches
    if (updateData.id !== id) {
      return c.json({ error: "ID mismatch" }, 400);
    }

    // Extract the update data (excluding id)
    const { id: _, ...jobUpdates } = updateData;

    // Update the cron job
    const job = await updateCronJob(id, userId, jobUpdates);

    if (!job) {
      return c.json({ error: "Cron job not found" }, 404);
    }

    return c.json({
      message: "Cron job updated successfully",
      job,
    });
  } catch (error) {
    console.error("Error updating cron job:", error);
    return c.json({ error: "Failed to update cron job" }, 500);
  }
});

// DELETE /api/schedules/:id - Delete a cron job
app.delete("/:id", async (c) => {
  try {
    const userId = getCurrentUserId(c);
    const id = c.req.param("id");
    const deleted = await deleteCronJob(id, userId);

    if (!deleted) {
      return c.json({ error: "Cron job not found" }, 404);
    }

    return c.json({
      message: "Cron job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cron job:", error);
    return c.json({ error: "Failed to delete cron job" }, 500);
  }
});

// POST /api/schedules/toggle - Enable/disable a cron job
app.post(
  "/toggle",
  arktypeValidator("json", ToggleCronJobSchema),
  async (c) => {
    try {
      const userId = getCurrentUserId(c);
      const { id, isActive } = c.req.valid("json");

      const job = await toggleCronJobStatus(id, userId, isActive);

      if (!job) {
        return c.json({ error: "Cron job not found" }, 404);
      }

      return c.json({
        message: `Cron job ${isActive ? "enabled" : "disabled"} successfully`,
        job,
      });
    } catch (error) {
      console.error("Error toggling cron job status:", error);
      return c.json({ error: "Failed to toggle cron job status" }, 500);
    }
  }
);

export default app;
