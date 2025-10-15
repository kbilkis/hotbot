import { arktypeValidator } from "@hono/arktype-validator";
import { type } from "arktype";
import { Hono } from "hono";

import { getCurrentUserId, getCurrentUser } from "@/lib/auth/clerk";
import {
  getSubscriptionByUserId,
  getUserUsage,
  upsertSubscription,
} from "@/lib/database/queries/subscriptions";
import { createErrorResponse, handleApiError } from "@/lib/errors/api-error";
import { createStripeService } from "@/lib/stripe/service";

// Validation schemas
const CheckoutRequestSchema = type({
  successUrl: "string",
  cancelUrl: "string",
});

const PortalRequestSchema = type({
  returnUrl: "string",
});

const subscriptions = new Hono()
  /**
   * POST /api/subscriptions/checkout
   * Create a Stripe checkout session for Pro tier upgrade
   */
  .post(
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
              success: false,
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
          success: true,
          checkoutUrl: checkoutSession.url,
          sessionId: checkoutSession.id,
        });
      } catch (error) {
        // Handle specific Stripe errors
        if (error instanceof Error) {
          if (error.message.includes("Customer")) {
            return handleApiError(
              c,
              error,
              500,
              "Failed to create or retrieve customer",
              "Failed to create or retrieve customer"
            );
          }
          if (error.message.includes("checkout")) {
            return handleApiError(
              c,
              error,
              500,
              "Failed to create checkout session",
              "Failed to create checkout session"
            );
          }
        }
        throw error;
      }
    }
  )
  /**
   * POST /api/subscriptions/portal
   * Create a Stripe Customer Portal session for subscription management
   */
  .post("/portal", arktypeValidator("json", PortalRequestSchema), async (c) => {
    try {
      const userId = getCurrentUserId(c);

      const { returnUrl } = c.req.valid("json");

      // Get user subscription
      const subscription = await getSubscriptionByUserId(userId);

      if (!subscription) {
        return createErrorResponse(
          c,
          500,
          "No subscription found. Please create a subscription first.",
          "No subscription found. Please create a subscription first."
        );
      }

      // Only allow portal access for users with Stripe customers
      if (!subscription.stripeCustomerId) {
        return createErrorResponse(
          c,
          500,
          "No billing account found. Please upgrade to Pro first.",
          "No billing account found. Please upgrade to Pro first."
        );
      }

      const stripeService = createStripeService();

      // Create billing portal session
      const portalSession = await stripeService.createBillingPortalSession(
        subscription.stripeCustomerId,
        returnUrl
      );

      return c.json({
        success: true,
        portalUrl: portalSession.url,
      });
    } catch (error) {
      console.error("Billing portal session creation failed:", error);

      // Handle specific Stripe errors
      if (error instanceof Error) {
        if (error.message === "BILLING_PORTAL_NOT_CONFIGURED") {
          return handleApiError(
            c,
            error,
            503,
            "Billing portal is not configured. Please contact support to manage your subscription.",
            "Billing portal is not configured. Please contact support to manage your subscription."
          );
        }
        if (error.message.includes("Customer")) {
          return handleApiError(
            c,
            error,
            400,
            "Invalid customer account",
            "Invalid customer account"
          );
        }
        if (error.message.includes("portal")) {
          return handleApiError(
            c,
            error,
            500,
            "Failed to create billing portal session",
            "Failed to create billing portal session"
          );
        }
      }
      return handleApiError(
        c,
        error,
        500,
        "Internal server error during portal creation",
        "Internal server error during portal creation"
      );
    }
  })
  /**
   * GET /api/subscriptions/current
   * Get current subscription status, tier, and usage information
   */
  .get("/current", async (c) => {
    const userId = getCurrentUserId(c);

    // Get subscription and usage data in parallel
    const [subscription, usage] = await Promise.all([
      getSubscriptionByUserId(userId),
      getUserUsage(userId),
    ]);

    // If no subscription exists, user is on free tier by default
    if (!subscription) {
      return c.json({
        success: true,
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
      success: true,
      tier: subscription.tier,
      status: subscription.status,
      usage,
      limits: tierLimits[subscription.tier],
      billing,
      createdAt: subscription.createdAt?.toISOString(),
      updatedAt: subscription.updatedAt?.toISOString(),
    });
  });

export default subscriptions;
