import { Hono } from "hono";
import Stripe from "stripe";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dependencies
vi.mock("@/lib/stripe/service", () => ({
  createStripeService: vi.fn(),
}));

vi.mock("@/lib/database/queries/subscriptions", () => ({
  getSubscriptionByStripeCustomerId: vi.fn(),
  getSubscriptionByStripeSubscriptionId: vi.fn(),
  syncSubscriptionFromStripe: vi.fn(),
  updateSubscriptionByStripeSubscriptionId: vi.fn(),
}));

describe("Webhook API Endpoints", () => {
  let app: Hono;
  let mockStripeService: any;
  let mockQueries: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock Stripe service instance
    mockStripeService = {
      constructWebhookEvent: vi.fn(),
    };

    // Get mock instances
    const { createStripeService } = await import("@/lib/stripe/service");
    (createStripeService as any).mockReturnValue(mockStripeService);

    mockQueries = await import("@/lib/database/queries/subscriptions");

    // Import the webhook routes after mocking
    const webhooksModule = await import("@/api/webhooks");
    app = new Hono();
    app.route("/", webhooksModule.default);
  });

  describe("POST /stripe", () => {
    it("should return 400 when signature is missing", async () => {
      const response = await app.request("/stripe", {
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Missing signature");
    });

    it("should return 400 when signature verification fails", async () => {
      mockStripeService.constructWebhookEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const response = await app.request("/stripe", {
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": "invalid-signature",
        },
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Invalid signature");
    });

    it("should handle subscription.created event successfully", async () => {
      const mockEvent: Stripe.Event = {
        id: "evt_test_123",
        type: "customer.subscription.created",
        data: {
          object: {
            id: "sub_test_123",
            customer: "cus_test_123",
            status: "active",
            current_period_start: 1640995200, // 2022-01-01
            current_period_end: 1643673600, // 2022-02-01
            cancel_at_period_end: false,
          } as Stripe.Subscription,
        },
        created: 1640995200,
        livemode: false,
        pending_webhooks: 1,
        request: { id: null, idempotency_key: null },
        api_version: "2025-08-27.basil",
        object: "event",
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockQueries.getSubscriptionByStripeCustomerId.mockResolvedValue({
        id: "sub_db_123",
        userId: "user_123",
        stripeCustomerId: "cus_test_123",
      });
      mockQueries.syncSubscriptionFromStripe.mockResolvedValue({});

      const response = await app.request("/stripe", {
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": "valid-signature",
        },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.received).toBe(true);

      expect(
        mockQueries.getSubscriptionByStripeCustomerId
      ).toHaveBeenCalledWith("cus_test_123");
      expect(mockQueries.syncSubscriptionFromStripe).toHaveBeenCalledWith(
        "cus_test_123",
        {
          subscriptionId: "sub_test_123",
          tier: "pro",
          status: "active",
          currentPeriodStart: new Date(1640995200 * 1000),
          currentPeriodEnd: new Date(1643673600 * 1000),
          cancelAtPeriodEnd: false,
        }
      );
    });

    it("should handle subscription.deleted event successfully", async () => {
      const mockEvent: Stripe.Event = {
        id: "evt_test_456",
        type: "customer.subscription.deleted",
        data: {
          object: {
            id: "sub_test_456",
            customer: "cus_test_456",
            status: "canceled",
            current_period_start: 1640995200,
            current_period_end: 1643673600,
            cancel_at_period_end: true,
          } as Stripe.Subscription,
        },
        created: 1640995200,
        livemode: false,
        pending_webhooks: 1,
        request: { id: null, idempotency_key: null },
        api_version: "2025-08-27.basil",
        object: "event",
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockQueries.getSubscriptionByStripeCustomerId.mockResolvedValue({
        id: "sub_db_456",
        userId: "user_456",
        stripeCustomerId: "cus_test_456",
      });
      mockQueries.syncSubscriptionFromStripe.mockResolvedValue({});

      const response = await app.request("/stripe", {
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": "valid-signature",
        },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.received).toBe(true);

      expect(mockQueries.syncSubscriptionFromStripe).toHaveBeenCalledWith(
        "cus_test_456",
        {
          subscriptionId: "sub_test_456",
          tier: "free",
          status: "canceled",
          currentPeriodStart: new Date(1640995200 * 1000),
          currentPeriodEnd: new Date(1643673600 * 1000),
          cancelAtPeriodEnd: true,
        }
      );
    });

    it("should handle payment.succeeded event successfully", async () => {
      const mockEvent: Stripe.Event = {
        id: "evt_test_789",
        type: "invoice.payment_succeeded",
        data: {
          object: {
            id: "in_test_789",
            subscription: "sub_test_789",
          } as Stripe.Invoice,
        },
        created: 1640995200,
        livemode: false,
        pending_webhooks: 1,
        request: { id: null, idempotency_key: null },
        api_version: "2025-08-27.basil",
        object: "event",
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockQueries.getSubscriptionByStripeSubscriptionId.mockResolvedValue({
        id: "sub_db_789",
        userId: "user_789",
        stripeSubscriptionId: "sub_test_789",
      });
      mockQueries.updateSubscriptionByStripeSubscriptionId.mockResolvedValue(
        {}
      );

      const response = await app.request("/stripe", {
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": "valid-signature",
        },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.received).toBe(true);

      expect(
        mockQueries.updateSubscriptionByStripeSubscriptionId
      ).toHaveBeenCalledWith("sub_test_789", {
        status: "active",
        tier: "pro",
      });
    });

    it("should return 500 when webhook processing fails", async () => {
      const mockEvent: Stripe.Event = {
        id: "evt_test_error",
        type: "customer.subscription.created",
        data: {
          object: {
            id: "sub_test_error",
            customer: "cus_test_error",
            status: "active",
            current_period_start: 1640995200,
            current_period_end: 1643673600,
            cancel_at_period_end: false,
          } as Stripe.Subscription,
        },
        created: 1640995200,
        livemode: false,
        pending_webhooks: 1,
        request: { id: null, idempotency_key: null },
        api_version: "2025-08-27.basil",
        object: "event",
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockQueries.getSubscriptionByStripeCustomerId.mockRejectedValue(
        new Error("Database error")
      );

      const response = await app.request("/stripe", {
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": "valid-signature",
        },
      });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Processing failed");
    });

    it("should handle unhandled event types gracefully", async () => {
      const mockEvent: Stripe.Event = {
        id: "evt_test_unhandled",
        type: "customer.created" as any,
        data: {
          object: {} as unknown,
        },
        created: 1640995200,
        livemode: false,
        pending_webhooks: 1,
        request: { id: null, idempotency_key: null },
        api_version: "2025-08-27.basil",
        object: "event",
      };

      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);

      const response = await app.request("/stripe", {
        method: "POST",
        body: JSON.stringify({ test: "data" }),
        headers: {
          "Content-Type": "application/json",
          "stripe-signature": "valid-signature",
        },
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.received).toBe(true);
    });
  });
});
