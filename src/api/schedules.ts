import { arktypeValidator } from "@hono/arktype-validator";
import { Hono } from "hono";

import {
  checkCronJobLimits,
  checkCronJobInterval,
} from "@/lib/access-control/middleware";
import { getCurrentUserId } from "@/lib/auth/clerk";
import {
  createCronJob,
  getUserCronJobs,
  getCronJobById,
  updateCronJob,
  deleteCronJob,
  toggleCronJobStatus,
} from "@/lib/database/queries/cron-jobs";
import { createErrorResponse } from "@/lib/errors/api-error";
import { processJob as notificationProcessor } from "@/lib/notifications/processor";
import {
  CreateCronJobSchema,
  UpdateCronJobSchema,
  ToggleCronJobSchema,
  ListCronJobsQuerySchema,
} from "@/lib/validation/cron-job-schemas";

const app = new Hono()
  // GET /api/schedules - List all cron jobs for the authenticated user
  .get("/", arktypeValidator("query", ListCronJobsQuerySchema), async (c) => {
    const userId = getCurrentUserId(c);
    const query = c.req.valid("query");
    const jobs = await getUserCronJobs(userId);

    // Filter by active status if specified
    let filteredJobs = jobs;
    if (query.active !== undefined) {
      filteredJobs = jobs.filter((job) => job.isActive === query.active);
    }

    return c.json({
      success: true,
      jobs: filteredJobs,
    });
  })
  // GET /api/schedules/:id - Get a specific cron job
  .get("/:id", async (c) => {
    const userId = getCurrentUserId(c);
    const id = c.req.param("id");
    const job = await getCronJobById(id, userId);

    if (!job) {
      return c.json({ success: false, error: "Cron job not found" }, 404);
    }

    return c.json({ success: true, job });
  })
  // POST /api/schedules - Create a new cron job
  .post("/", arktypeValidator("json", CreateCronJobSchema), async (c) => {
    const userId = getCurrentUserId(c);
    const jobData = c.req.valid("json");

    // Check tier limits before creating cron job
    await checkCronJobLimits(userId);

    // Validate cron interval for user's tier
    await checkCronJobInterval(userId, jobData.cronExpression);

    // Cron expression is already in UTC from the client
    const job = await createCronJob(userId, jobData);

    return c.json(
      {
        success: true,
        message: "Cron job created successfully",
        job,
      },
      201
    );
  })
  // PUT /api/schedules/:id - Update a cron job
  .put("/:id", arktypeValidator("json", UpdateCronJobSchema), async (c) => {
    const userId = getCurrentUserId(c);
    const id = c.req.param("id");
    const updateData = c.req.valid("json");

    // Verify the ID matches
    if (updateData.id !== id) {
      return c.json(
        { success: false, error: "ID mismatch", message: "ID mismatch" },
        400
      );
    }

    // Extract the update data (excluding id) - cron expression is already in UTC
    const { id: _, ...jobUpdates } = updateData;

    // Validate cron interval for user's tier if cronExpression is being updated
    if (jobUpdates.cronExpression) {
      await checkCronJobInterval(userId, jobUpdates.cronExpression);
    }

    // Update the cron job
    const job = await updateCronJob(id, userId, jobUpdates);

    if (!job) {
      return createErrorResponse(
        c,
        404,
        "Cron job not found",
        "Cron job not found"
      );
    }

    return c.json({
      success: true,
      message: "Cron job updated successfully",
      job,
    });
  })
  // DELETE /api/schedules/:id - Delete a cron job
  .delete("/:id", async (c) => {
    const userId = getCurrentUserId(c);
    const id = c.req.param("id");
    const deleted = await deleteCronJob(id, userId);

    if (!deleted) {
      return createErrorResponse(
        c,
        404,
        "Cron job not found",
        "Cron job not found"
      );
    }

    return c.json({
      success: true,
      message: "Cron job deleted successfully",
    });
  })
  // POST /api/schedules/toggle - Enable/disable a cron job
  .post("/toggle", arktypeValidator("json", ToggleCronJobSchema), async (c) => {
    const userId = getCurrentUserId(c);
    const { id, isActive } = c.req.valid("json");

    const job = await toggleCronJobStatus(id, userId, isActive);

    if (!job) {
      return createErrorResponse(
        c,
        404,
        "Cron job not found",
        "Cron job not found"
      );
    }

    return c.json({
      success: true,
      message: `Cron job ${isActive ? "enabled" : "disabled"} successfully`,
      job,
    });
  })
  // POST /api/schedules/:id/test - Trigger a cron job immediately for testing
  .post("/:id/test", async (c) => {
    const userId = getCurrentUserId(c);
    const id = c.req.param("id");

    // Verify the job exists and belongs to the user
    const job = await getCronJobById(id, userId);

    if (!job) {
      return createErrorResponse(
        c,
        404,
        "Cron job not found",
        "Cron job not found"
      );
    }

    try {
      await notificationProcessor(job);

      return c.json({
        success: true,
        message: "Schedule executed successfully",
      });
    } catch (error) {
      console.error("Failed to execute schedule:", error);
      return createErrorResponse(
        c,
        500,
        "Failed to execute schedule",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  });

export default app;
