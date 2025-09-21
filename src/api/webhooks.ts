import { Hono } from "hono";
import Stripe from "stripe";

import {
  getSubscriptionByStripeCustomerId,
  getSubscriptionByStripeSubscriptionId,
  syncSubscriptionFromStripe,
  updateSubscriptionByStripeSubscriptionId,
} from "../lib/database/queries/subscriptions";
import { createStripeService } from "../lib/stripe/service";

const webhooks = new Hono();

/**
 * Stripe webhook endpoint
 * Handles subscription lifecycle events and keeps the database in sync
 */
webhooks.post("/stripe", async (c) => {
  try {
    // Get raw body and signature
    const body = await c.req.text();
    const signature = c.req.header("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature header");
      return c.json({ error: "Missing signature" }, 400);
    }

    // Verify webhook signature and construct event
    let event: Stripe.Event;

    try {
      const stripeService = createStripeService();
      event = await stripeService.constructWebhookEvent(body, signature);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return c.json({ error: "Invalid signature" }, 400);
    }

    console.log(`Processing webhook event: ${event.type} (${event.id})`);

    // Route event to appropriate handler
    try {
      await handleWebhookEvent(event);
      console.log(`Successfully processed webhook event: ${event.type}`);
      return c.json({ received: true });
    } catch (error) {
      console.error(
        `Error processing webhook event ${event?.type || "unknown"}:`,
        error
      );
      return c.json({ error: "Processing failed" }, 500);
    }
  } catch (error) {
    console.error("Webhook endpoint error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * Main webhook event router
 * Dispatches events to specific handlers based on event type
 */
async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      // Subscription lifecycle events
      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      // Payment events
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Customer events
      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      // Additional subscription events for comprehensive handling
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  } catch (error) {
    console.error(
      `Error in webhook handler for event ${event.type} (${event.id}):`,
      error
    );
    // Re-throw to ensure webhook endpoint returns error status for retry
    throw error;
  }
}

/**
 * Safely convert Stripe timestamp to Date object
 */
function safeTimestampToDate(
  timestamp: number | null | undefined
): Date | undefined {
  if (
    timestamp === null ||
    timestamp === undefined ||
    typeof timestamp !== "number"
  ) {
    return undefined;
  }

  try {
    const date = new Date(timestamp * 1000);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid timestamp: ${timestamp}`);
      return undefined;
    }
    return date;
  } catch (error) {
    console.warn(`Error converting timestamp ${timestamp}:`, error);
    return undefined;
  }
}

/**
 * Handle subscription created event
 * Updates user tier to Pro when subscription is created
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log(`Handling subscription created: ${subscription.id}`);

  try {
    const customerId = subscription.customer as string;
    const existingSubscription = await getSubscriptionByStripeCustomerId(
      customerId
    );

    if (!existingSubscription) {
      console.error(`No subscription record found for customer: ${customerId}`);
      return;
    }

    // Determine tier based on subscription status
    const tier =
      subscription.status === "active" || subscription.status === "trialing"
        ? "pro"
        : "free";

    // Safely convert Stripe timestamps to Date objects
    const subscriptionData = subscription as any;
    const currentPeriodStart = safeTimestampToDate(
      subscriptionData.current_period_start
    );
    const currentPeriodEnd = safeTimestampToDate(
      subscriptionData.current_period_end
    );

    // Update subscription to Pro tier
    await syncSubscriptionFromStripe(customerId, {
      subscriptionId: subscription.id,
      tier,
      status: subscription.status as
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "trialing"
        | "unpaid",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
    });

    console.log(
      `Updated user to ${tier} tier for subscription: ${subscription.id} (status: ${subscription.status})`
    );
  } catch (error) {
    console.error(
      `Error handling subscription created ${subscription.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle subscription updated event
 * Syncs subscription status and billing information
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log(`Handling subscription updated: ${subscription.id}`);

  try {
    const customerId = subscription.customer as string;

    // Determine tier based on subscription status
    const tier =
      subscription.status === "active" || subscription.status === "trialing"
        ? "pro"
        : "free";

    // Safely convert Stripe timestamps to Date objects
    const subscriptionData = subscription as any;
    const currentPeriodStart = safeTimestampToDate(
      subscriptionData.current_period_start
    );
    const currentPeriodEnd = safeTimestampToDate(
      subscriptionData.current_period_end
    );

    await syncSubscriptionFromStripe(customerId, {
      subscriptionId: subscription.id,
      tier,
      status: subscription.status as
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "trialing"
        | "unpaid",
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end || false,
    });

    console.log(
      `Updated subscription status to ${subscription.status} (tier: ${tier}) for: ${subscription.id}`
    );
  } catch (error) {
    console.error(
      `Error handling subscription updated ${subscription.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle subscription deleted event
 * Downgrades user to Free tier when subscription is cancelled
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log(`Handling subscription deleted: ${subscription.id}`);

  const customerId = subscription.customer as string;
  const existingSubscription = await getSubscriptionByStripeCustomerId(
    customerId
  );

  if (!existingSubscription) {
    console.error(`No subscription record found for customer: ${customerId}`);
    return;
  }

  // Safely convert Stripe timestamps to Date objects
  const subscriptionData = subscription as any;
  const currentPeriodStart = safeTimestampToDate(
    subscriptionData.current_period_start
  );
  const currentPeriodEnd = safeTimestampToDate(
    subscriptionData.current_period_end
  );

  // Downgrade to Free tier
  await syncSubscriptionFromStripe(customerId, {
    subscriptionId: subscription.id,
    tier: "free",
    status: "canceled",
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: true,
  });

  // TODO: Implement resource cleanup for downgrade
  // This will be handled in a later task (8.1 Implement downgrade logic)
  console.log(
    `Downgraded user to Free tier for subscription: ${subscription.id}. Resource cleanup will be handled separately.`
  );
}

/**
 * Handle successful payment event
 * Ensures subscription remains active after successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const invoiceData = invoice as any;

  if (!invoiceData.subscription) {
    console.log("Payment succeeded for non-subscription invoice");
    return;
  }

  console.log(
    `Handling payment succeeded for subscription: ${invoiceData.subscription}`
  );

  try {
    const subscription = await getSubscriptionByStripeSubscriptionId(
      invoiceData.subscription as string
    );

    if (!subscription) {
      console.error(
        `No subscription record found for: ${invoiceData.subscription}`
      );
      return;
    }

    // Ensure subscription is active after successful payment
    await updateSubscriptionByStripeSubscriptionId(
      invoiceData.subscription as string,
      {
        status: "active",
        tier: "pro",
      }
    );

    console.log(
      `Confirmed active status for subscription: ${invoiceData.subscription}`
    );
  } catch (error) {
    console.error(
      `Error handling payment succeeded for ${invoiceData.subscription}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle failed payment event
 * Logs payment failure but maintains access during retry period
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const invoiceData = invoice as any;

  if (!invoiceData.subscription) {
    console.log("Payment failed for non-subscription invoice");
    return;
  }

  console.log(
    `Handling payment failed for subscription: ${invoiceData.subscription}`
  );

  try {
    const subscription = await getSubscriptionByStripeSubscriptionId(
      invoiceData.subscription as string
    );

    if (!subscription) {
      console.error(
        `No subscription record found for: ${invoiceData.subscription}`
      );
      return;
    }

    // Update status to past_due but maintain Pro tier during retry period
    await updateSubscriptionByStripeSubscriptionId(
      invoiceData.subscription as string,
      {
        status: "past_due",
        // Keep tier as "pro" during retry period
      }
    );

    console.log(
      `Updated subscription to past_due status: ${invoiceData.subscription}`
    );
  } catch (error) {
    console.error(
      `Error handling payment failed for ${invoiceData.subscription}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle trial will end event
 * Logs trial ending but doesn't change subscription status
 */
async function handleTrialWillEnd(
  subscription: Stripe.Subscription
): Promise<void> {
  console.log(`Trial will end for subscription: ${subscription.id}`);

  // Log the event for potential user notification
  // The actual subscription status will be updated by other events
  const subscriptionData = subscription as unknown;
  const trialEnd = subscriptionData.trial_end;

  if (trialEnd) {
    console.log(
      `Trial ending on ${new Date(
        trialEnd * 1000
      ).toISOString()} for subscription: ${subscription.id}`
    );
  }
}

export default webhooks;
