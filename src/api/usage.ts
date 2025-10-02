import { Hono } from "hono";

import { getUserUsageWithLimits } from "../lib/access-control/index";
import { getCurrentUserId } from "../lib/auth/clerk";

const app = new Hono()
  // GET /api/usage - Get current usage and limits for the authenticated user
  .get("/", async (c) => {
    try {
      const userId = getCurrentUserId(c);
      const usageInfo = await getUserUsageWithLimits(userId);

      return c.json({
        success: true,
        tier: usageInfo.tier,
        limits: usageInfo.limits,
        usage: usageInfo.usage,
        subscription: usageInfo.subscription
          ? {
              id: usageInfo.subscription.id,
              tier: usageInfo.subscription.tier,
              status: usageInfo.subscription.status,
              currentPeriodStart:
                usageInfo.subscription.currentPeriodStart?.toISOString(),
              currentPeriodEnd:
                usageInfo.subscription.currentPeriodEnd?.toISOString(),
              cancelAtPeriodEnd: usageInfo.subscription.cancelAtPeriodEnd,
            }
          : null,
      });
    } catch (error) {
      console.error("Error fetching usage information:", error);
      return c.json(
        { success: false, error: "Failed to fetch usage information" },
        500
      );
    }
  });

export default app;
export type UsageApiType = typeof app;
