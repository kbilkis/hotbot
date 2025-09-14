import { arktypeValidator } from "@hono/arktype-validator";
import { type } from "arktype";
import { Hono } from "hono";

import {
  requireAuth,
  getCurrentUserId,
  getCurrentUser,
} from "@/lib/auth/clerk";

import {
  getSubscriptionByUserId,
  getUserUsage,
  upsertSubscription,
} from "../lib/database/queries/subscriptions";
import { createStripeService } from "../lib/stripe/service";

const subscriptions = new Hono();

// Apply authentication to all subscription routes
subscriptions.use("/*", requireAuth());

// Validation schemas
const CheckoutRequestSchema = type({
  successUrl: "string",
  cancelUrl: "string",
});

const PortalRequestSchema = type({
  returnUrl: "string",
});

/**
 * POST /api/subscriptions/checkout
 * Create a Stripe checkout session for Pro tier upgrade
 */
subscriptions.post(
  "/checkout",
  arktypeValidator("json", CheckoutRequestSchema),
  async (c) => {
    try {
      const userId = getCurrentUserId(c);
      const user = getCurrentUser(c);

      const { successUrl, cancelUrl } = c.req.valid("json");

      // Get or create user subscription record
      let subscription = await getSubscriptionByUserId(userId);

      const stripeService = createStripeService();

      // If no subscription exists, create a Stripe customer and subscription record
      if (!subscription) {
        const customer = await stripeService.createCustomer(user.email, {
          userId,
        });

        subscription = await upsertSubscription({
          userId,
          stripeCustomerId: customer.id,
          tier: "free",
          status: "active",
        });
      }

      // Check if user is already on Pro tier
      if (subscription.tier === "pro" && subscription.status === "active") {
        return c.json(
          {
            error: "User is already subscribed to Pro tier",
          },
          400
        );
      }

      // Create checkout session
      const checkoutSession = await stripeService.createCheckoutSession(
        subscription.stripeCustomerId,
        successUrl,
        cancelUrl,
        undefined, // Use default Pro price ID from config
        {
          userId,
          upgradeFrom: subscription.tier,
        }
      );

      return c.json({
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
      });
    } catch (error) {
      console.error("Checkout session creation failed:", error);

      // Handle specific Stripe errors
      if (error instanceof Error) {
        if (error.message.includes("Customer")) {
          return c.json(
            { error: "Failed to create or retrieve customer" },
            500
          );
        }
        if (error.message.includes("checkout")) {
          return c.json({ error: "Failed to create checkout session" }, 500);
        }
      }

      return c.json(
        { error: "Internal server error during checkout creation" },
        500
      );
    }
  }
);

/**
 * POST /api/subscriptions/portal
 * Create a Stripe Customer Portal session for subscription management
 */
subscriptions.post(
  "/portal",
  arktypeValidator("json", PortalRequestSchema),
  async (c) => {
    try {
      const userId = getCurrentUserId(c);

      const { returnUrl } = c.req.valid("json");

      // Get user subscription
      const subscription = await getSubscriptionByUserId(userId);

      if (!subscription) {
        return c.json(
          {
            error: "No subscription found. Please create a subscription first.",
          },
          404
        );
      }

      // Only allow portal access for users with Stripe customers
      if (!subscription.stripeCustomerId) {
        return c.json(
          {
            error: "No billing account found. Please upgrade to Pro first.",
          },
          400
        );
      }

      const stripeService = createStripeService();

      // Create billing portal session
      const portalSession = await stripeService.createBillingPortalSession(
        subscription.stripeCustomerId,
        returnUrl
      );

      return c.json({
        portalUrl: portalSession.url,
      });
    } catch (error) {
      console.error("Billing portal session creation failed:", error);

      // Handle specific Stripe errors
      if (error instanceof Error) {
        if (error.message.includes("Customer")) {
          return c.json({ error: "Invalid customer account" }, 400);
        }
        if (error.message.includes("portal")) {
          return c.json(
            { error: "Failed to create billing portal session" },
            500
          );
        }
      }

      return c.json(
        { error: "Internal server error during portal creation" },
        500
      );
    }
  }
);

/**
 * GET /api/subscriptions/current
 * Get current subscription status, tier, and usage information
 */
subscriptions.get("/current", async (c) => {
  try {
    const userId = getCurrentUserId(c);

    // Get subscription and usage data in parallel
    const [subscription, usage] = await Promise.all([
      getSubscriptionByUserId(userId),
      getUserUsage(userId),
    ]);

    // If no subscription exists, user is on free tier by default
    if (!subscription) {
      return c.json({
        tier: "free",
        status: "active",
        usage,
        limits: {
          gitProviders: 1,
          messagingProviders: 1,
          cronJobs: 1,
          minCronInterval: 24,
        },
        billing: null,
      });
    }

    // Define tier limits
    const tierLimits = {
      free: {
        gitProviders: 1,
        messagingProviders: 1,
        cronJobs: 1,
        minCronInterval: 24,
      },
      pro: {
        gitProviders: null, // unlimited
        messagingProviders: null, // unlimited
        cronJobs: null, // unlimited
        minCronInterval: 0,
      },
    };

    // Prepare billing information
    const billing = subscription.stripeSubscriptionId
      ? {
          subscriptionId: subscription.stripeSubscriptionId,
          customerId: subscription.stripeCustomerId,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null;

    return c.json({
      tier: subscription.tier,
      status: subscription.status,
      usage,
      limits: tierLimits[subscription.tier],
      billing,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    });
  } catch (error) {
    console.error("Failed to get subscription status:", error);
    return c.json(
      { error: "Internal server error while fetching subscription" },
      500
    );
  }
});

export default subscriptions;
