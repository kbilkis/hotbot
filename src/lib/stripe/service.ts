import Stripe from "stripe";

/**
 * Configuration interface for Stripe service
 */
interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  proPriceId: string;
  isTestMode?: boolean;
}

/**
 * Stripe service wrapper for subscription management
 * Handles customer creation, subscription management, and webhook processing
 */
export class StripeService {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    });
  }

  /**
   * Create a new Stripe customer
   */
  async createCustomer(
    email: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        metadata: {
          ...metadata,
          created_by: "git-messaging-scheduler",
        },
      });
      return customer;
    } catch (error) {
      throw this.handleStripeError(error, "Failed to create customer");
    }
  }

  /**
   * Retrieve a Stripe customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        throw new Error("Customer has been deleted");
      }
      return customer as Stripe.Customer;
    } catch (error) {
      throw this.handleStripeError(error, "Failed to retrieve customer");
    }
  }

  /**
   * Update a Stripe customer
   */
  async updateCustomer(
    customerId: string,
    updates: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.update(customerId, updates);
      return customer;
    } catch (error) {
      throw this.handleStripeError(error, "Failed to update customer");
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(
    customerId: string,
    priceId?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId || this.config.proPriceId,
          },
        ],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: {
          ...metadata,
          created_by: "git-messaging-scheduler",
        },
      });
      return subscription;
    } catch (error) {
      throw this.handleStripeError(error, "Failed to create subscription");
    }
  }

  /**
   * Retrieve a subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId
      );
      return subscription;
    } catch (error) {
      throw this.handleStripeError(error, "Failed to retrieve subscription");
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Stripe.SubscriptionUpdateParams
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        updates
      );
      return subscription;
    } catch (error) {
      throw this.handleStripeError(error, "Failed to update subscription");
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      if (cancelAtPeriodEnd) {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (error) {
      throw this.handleStripeError(error, "Failed to cancel subscription");
    }
  }

  /**
   * Create a Stripe Checkout session for subscription upgrade
   */
  async createCheckoutSession(
    customerId: string,
    successUrl: string,
    cancelUrl: string,
    priceId?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId || this.config.proPriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        metadata: {
          ...metadata,
          created_by: "git-messaging-scheduler",
        },
      });
      return session;
    } catch (error) {
      throw this.handleStripeError(error, "Failed to create checkout session");
    }
  }

  /**
   * Create a billing portal session for subscription management
   */
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session;
    } catch (error) {
      // Handle specific billing portal configuration error
      if (
        error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.message.includes("No configuration provided")
      ) {
        throw new Error("BILLING_PORTAL_NOT_CONFIGURED");
      }
      throw this.handleStripeError(
        error,
        "Failed to create billing portal session"
      );
    }
  }

  /**
   * Construct and verify a webhook event from Stripe
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );
    } catch (error) {
      throw this.handleStripeError(error, "Failed to verify webhook signature");
    }
  }

  /**
   * List all subscriptions for a customer
   */
  async listCustomerSubscriptions(
    customerId: string
  ): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        expand: ["data.default_payment_method"],
      });
      return subscriptions.data;
    } catch (error) {
      throw this.handleStripeError(
        error,
        "Failed to list customer subscriptions"
      );
    }
  }

  /**
   * Get the active subscription for a customer
   */
  async getActiveSubscription(
    customerId: string
  ): Promise<Stripe.Subscription | null> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      return subscriptions.data[0] || null;
    } catch (error) {
      throw this.handleStripeError(error, "Failed to get active subscription");
    }
  }

  /**
   * Handle Stripe API errors with proper error messages
   */
  private handleStripeError(error: unknown, context: string): Error {
    if (error instanceof Stripe.errors.StripeError) {
      const message = `${context}: ${error.message}`;

      // Log different error types for debugging
      switch (error.type) {
        case "StripeCardError":
          console.error("Card error:", error.code, error.message);
          break;
        case "StripeRateLimitError":
          console.error("Rate limit error:", error.message);
          break;
        case "StripeInvalidRequestError":
          console.error("Invalid request error:", error.message);
          break;
        case "StripeAPIError":
          console.error("API error:", error.message);
          break;
        case "StripeConnectionError":
          console.error("Connection error:", error.message);
          break;
        case "StripeAuthenticationError":
          console.error("Authentication error:", error.message);
          break;
        default:
          console.error("Unknown Stripe error:", error.type, error.message);
      }

      return new Error(message);
    }

    console.error("Non-Stripe error:", error);
    return new Error(
      `${context}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  /**
   * Check if the service is in test mode
   */
  isTestMode(): boolean {
    return (
      this.config.isTestMode ?? this.config.secretKey.startsWith("sk_test_")
    );
  }

  /**
   * Get Stripe configuration (without sensitive data)
   */
  getConfig(): Omit<StripeConfig, "secretKey" | "webhookSecret"> {
    return {
      proPriceId: this.config.proPriceId,
      isTestMode: this.isTestMode(),
    };
  }
}

/**
 * Create and configure the Stripe service instance
 */
export function createStripeService(): StripeService {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is required");
  }
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is required");
  }
  if (!proPriceId) {
    throw new Error("STRIPE_PRO_PRICE_ID environment variable is required");
  }

  return new StripeService({
    secretKey,
    webhookSecret,
    proPriceId,
    isTestMode: secretKey.startsWith("sk_test_"),
  });
}

// Export types for use in other modules
export type { StripeConfig };
