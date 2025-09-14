import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";

// Mock the dependencies
vi.mock("@/lib/auth/clerk", () => ({
  requireAuth: () => (c: any, next: any) => next(),
  getCurrentUserId: () => "test-user-id",
  getCurrentUser: () => ({ id: "test-user-id", email: "test@example.com" }),
}));

vi.mock("@/lib/database/queries/subscriptions", () => ({
  getSubscriptionByUserId: vi.fn(),
  getUserUsage: vi.fn(),
  upsertSubscription: vi.fn(),
}));

vi.mock("@/lib/stripe/service", () => ({
  createStripeService: vi.fn(() => ({
    createCustomer: vi.fn(),
    createCheckoutSession: vi.fn(),
    createBillingPortalSession: vi.fn(),
  })),
}));

describe("Subscription API Endpoints", () => {
  let app: Hono;

  beforeEach(async () => {
    // Import the subscription routes after mocking
    const subscriptionsModule = await import(
      "../../../../src/api/subscriptions"
    );
    app = new Hono();
    app.route("/subscriptions", subscriptionsModule.default);
  });

  describe("GET /subscriptions/current", () => {
    it("should return free tier for user without subscription", async () => {
      const { getSubscriptionByUserId, getUserUsage } = await import(
        "@/lib/database/queries/subscriptions"
      );

      vi.mocked(getSubscriptionByUserId).mockResolvedValue(null);
      vi.mocked(getUserUsage).mockResolvedValue({
        gitProvidersCount: 0,
        messagingProvidersCount: 0,
        cronJobsCount: 0,
      });

      const res = await app.request("/subscriptions/current");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.tier).toBe("free");
      expect(data.status).toBe("active");
      expect(data.limits.gitProviders).toBe(1);
      expect(data.limits.messagingProviders).toBe(1);
      expect(data.limits.cronJobs).toBe(1);
      expect(data.limits.minCronInterval).toBe(24);
    });

    it("should return pro tier for user with pro subscription", async () => {
      const { getSubscriptionByUserId, getUserUsage } = await import(
        "@/lib/database/queries/subscriptions"
      );

      const mockSubscription = {
        id: "sub-123",
        userId: "test-user-id",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        tier: "pro" as const,
        status: "active" as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getSubscriptionByUserId).mockResolvedValue(mockSubscription);
      vi.mocked(getUserUsage).mockResolvedValue({
        gitProvidersCount: 5,
        messagingProvidersCount: 3,
        cronJobsCount: 10,
      });

      const res = await app.request("/subscriptions/current");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.tier).toBe("pro");
      expect(data.status).toBe("active");
      expect(data.limits.gitProviders).toBe(null); // unlimited
      expect(data.limits.messagingProviders).toBe(null); // unlimited
      expect(data.limits.cronJobs).toBe(null); // unlimited
      expect(data.limits.minCronInterval).toBe(0);
      expect(data.billing).toBeDefined();
      expect(data.billing.subscriptionId).toBe("sub_123");
    });
  });

  describe("POST /subscriptions/checkout", () => {
    it("should create checkout session for new user", async () => {
      const { getSubscriptionByUserId, upsertSubscription } = await import(
        "@/lib/database/queries/subscriptions"
      );
      const { createStripeService } = await import("@/lib/stripe/service");

      const mockStripeService = {
        createCustomer: vi.fn().mockResolvedValue({ id: "cus_123" }),
        createCheckoutSession: vi.fn().mockResolvedValue({
          url: "https://checkout.stripe.com/session_123",
          id: "cs_123",
        }),
      };

      vi.mocked(getSubscriptionByUserId).mockResolvedValue(null);
      vi.mocked(upsertSubscription).mockResolvedValue({
        id: "sub-123",
        userId: "test-user-id",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: null,
        tier: "free",
        status: "active",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(createStripeService).mockReturnValue(mockStripeService as any);

      const res = await app.request("/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          successUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.checkoutUrl).toBe("https://checkout.stripe.com/session_123");
      expect(data.sessionId).toBe("cs_123");
      expect(mockStripeService.createCustomer).toHaveBeenCalledWith(
        "test@example.com",
        { userId: "test-user-id" }
      );
    });

    it("should return error for user already on pro tier", async () => {
      const { getSubscriptionByUserId } = await import(
        "@/lib/database/queries/subscriptions"
      );

      const mockSubscription = {
        id: "sub-123",
        userId: "test-user-id",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        tier: "pro" as const,
        status: "active" as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getSubscriptionByUserId).mockResolvedValue(mockSubscription);

      const res = await app.request("/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          successUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("User is already subscribed to Pro tier");
    });
  });

  describe("POST /subscriptions/portal", () => {
    it("should create billing portal session for existing customer", async () => {
      const { getSubscriptionByUserId } = await import(
        "@/lib/database/queries/subscriptions"
      );
      const { createStripeService } = await import("@/lib/stripe/service");

      const mockSubscription = {
        id: "sub-123",
        userId: "test-user-id",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        tier: "pro" as const,
        status: "active" as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStripeService = {
        createBillingPortalSession: vi.fn().mockResolvedValue({
          url: "https://billing.stripe.com/session_123",
        }),
      };

      vi.mocked(getSubscriptionByUserId).mockResolvedValue(mockSubscription);
      vi.mocked(createStripeService).mockReturnValue(mockStripeService as any);

      const res = await app.request("/subscriptions/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: "https://example.com/dashboard",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.portalUrl).toBe("https://billing.stripe.com/session_123");
      expect(mockStripeService.createBillingPortalSession).toHaveBeenCalledWith(
        "cus_123",
        "https://example.com/dashboard"
      );
    });

    it("should return error for user without subscription", async () => {
      const { getSubscriptionByUserId } = await import(
        "@/lib/database/queries/subscriptions"
      );

      vi.mocked(getSubscriptionByUserId).mockResolvedValue(null);

      const res = await app.request("/subscriptions/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: "https://example.com/dashboard",
        }),
      });

      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe(
        "No subscription found. Please create a subscription first."
      );
    });
  });
});
