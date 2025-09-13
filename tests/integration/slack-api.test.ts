// Integration tests for Slack API routes

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Hono } from "hono";
import slackRoutes from "../../src/api/providers/messaging/slack";

// Mock dependencies
vi.mock("../../src/lib/slack", () => ({
  getSlackAuthUrl: vi.fn(),
  exchangeSlackToken: vi.fn(),
  getSlackChannels: vi.fn(),
  sendSlackMessage: vi.fn(),
  validateSlackToken: vi.fn(),
  getSlackUserInfo: vi.fn(),
  formatSlackPRMessage: vi.fn(),
}));

vi.mock("../../src/lib/auth/clerk", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("../../src/lib/database/queries/providers", () => ({
  upsertMessagingProvider: vi.fn(),
  getUserMessagingProvider: vi.fn(),
}));

import {
  getSlackAuthUrl,
  exchangeSlackToken,
  getSlackChannels,
  sendSlackMessage,
  validateSlackToken,
  getSlackUserInfo,
  formatSlackPRMessage,
} from "../../src/lib/slack";
import { getCurrentUserId } from "../../src/lib/auth/clerk";
import {
  upsertMessagingProvider,
  getUserMessagingProvider,
} from "../../src/lib/database/queries/providers";

describe("Slack API Routes", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route("/slack", slackRoutes);
    vi.clearAllMocks();

    // Mock getCurrentUserId to return a test user ID
    (getCurrentUserId as any).mockReturnValue("test-user-id");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("POST /slack/auth-url", () => {
    it("should generate auth URL successfully", async () => {
      const mockAuthUrl =
        "https://slack.com/oauth/v2/authorize?client_id=test&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=channels%3Aread%2Cchat%3Awrite&state=test-state";

      (getSlackAuthUrl as any).mockReturnValue(mockAuthUrl);

      const response = await app.request("/slack/auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirectUri: "http://localhost:3000/callback",
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.authUrl).toBe(mockAuthUrl);
      expect(data.state).toBeDefined();
      expect(getSlackAuthUrl).toHaveBeenCalledWith(
        expect.any(String),
        "http://localhost:3000/callback",
        undefined
      );
    });

    it("should handle custom scopes", async () => {
      const mockAuthUrl =
        "https://slack.com/oauth/v2/authorize?client_id=test&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=channels%3Aread&state=test-state";

      (getSlackAuthUrl as any).mockReturnValue(mockAuthUrl);

      const response = await app.request("/slack/auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirectUri: "http://localhost:3000/callback",
          scopes: ["channels:read"],
        }),
      });

      expect(response.status).toBe(200);
      expect(getSlackAuthUrl).toHaveBeenCalledWith(
        expect.any(String),
        "http://localhost:3000/callback",
        ["channels:read"]
      );
    });

    it("should return 400 for invalid request body", async () => {
      const response = await app.request("/slack/auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Missing redirectUri
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /slack/exchange-token", () => {
    it("should exchange token successfully", async () => {
      const mockTokenResponse = {
        accessToken: "xoxb-test-token",
        refreshToken: "xoxe-refresh-token",
        expiresAt: new Date("2024-12-31T23:59:59Z"),
        scope: "channels:read,chat:write",
        tokenType: "Bearer",
        teamId: "T1234567890",
        teamName: "Test Team",
        userId: "U1234567890",
      };

      const mockChannels = [
        {
          id: "C1234567890",
          name: "general",
          type: "public" as const,
          memberCount: 10,
        },
        {
          id: "C0987654321",
          name: "random",
          type: "public" as const,
          memberCount: 5,
        },
      ];

      const mockSavedProvider = {
        id: "provider-id-1",
        provider: "slack" as const,
        createdAt: new Date(),
      };

      (exchangeSlackToken as any).mockResolvedValue(mockTokenResponse);
      (getSlackChannels as any).mockResolvedValue(mockChannels);
      (upsertMessagingProvider as any).mockResolvedValue(mockSavedProvider);

      const response = await app.request("/slack/exchange-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "test-code",
          redirectUri: "http://localhost:3000/callback",
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.accessToken).toBe("xoxb-test-token");
      expect(data.teamName).toBe("Test Team");
      expect(data.channels).toEqual(mockChannels);
      expect(data.provider).toBeDefined();

      expect(exchangeSlackToken).toHaveBeenCalledWith(
        "test-code",
        "http://localhost:3000/callback"
      );
      expect(getSlackChannels).toHaveBeenCalledWith("xoxb-test-token");
      expect(upsertMessagingProvider).toHaveBeenCalledTimes(1); // Once for the provider
    });

    it("should handle token exchange failure", async () => {
      (exchangeSlackToken as any).mockRejectedValue(new Error("Invalid code"));

      const response = await app.request("/slack/exchange-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "invalid-code",
          redirectUri: "http://localhost:3000/callback",
        }),
      });

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe("Token exchange failed");
      expect(data.message).toBe("Invalid code");
    });
  });

  describe("GET /slack/channels", () => {
    it("should fetch channels successfully", async () => {
      const mockProvider = {
        id: "provider-id",
        accessToken: "xoxb-test-token",
        provider: "slack" as const,
      };

      const mockChannels = [
        {
          id: "C1234567890",
          name: "general",
          type: "public" as const,
          memberCount: 10,
        },
        {
          id: "G0987654321",
          name: "private-channel",
          type: "private" as const,
          memberCount: 3,
        },
      ];

      (getUserMessagingProvider as any).mockResolvedValue(mockProvider);
      (getSlackChannels as any).mockResolvedValue(mockChannels);

      const response = await app.request("/slack/channels");

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.channels).toEqual(mockChannels);
      expect(getUserMessagingProvider).toHaveBeenCalledWith(
        "test-user-id",
        "slack"
      );
      expect(getSlackChannels).toHaveBeenCalledWith("xoxb-test-token");
    });

    it("should return 404 when provider not connected", async () => {
      (getUserMessagingProvider as any).mockResolvedValue(null);

      const response = await app.request("/slack/channels");

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe("Provider not connected");
    });
  });

  describe("POST /slack/send-message", () => {
    it("should send message successfully", async () => {
      (sendSlackMessage as any).mockResolvedValue(undefined);

      const response = await app.request("/slack/send-message", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "C1234567890",
          message: "Hello, World!",
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.channel).toBe("C1234567890");
      expect(data.data.message).toBe("Hello, World!");
      expect(sendSlackMessage).toHaveBeenCalledWith(
        "test-token",
        "C1234567890",
        "Hello, World!"
      );
    });

    it("should handle send message failure", async () => {
      (sendSlackMessage as any).mockRejectedValue(
        new Error("Channel not found")
      );

      const response = await app.request("/slack/send-message", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "C1234567890",
          message: "Hello, World!",
        }),
      });

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe("Message send failed");
      expect(data.message).toBe("Channel not found");
    });
  });

  describe("GET /slack/user", () => {
    it("should fetch user info successfully", async () => {
      const mockProvider = {
        id: "provider-id",
        accessToken: "xoxb-test-token",
        provider: "slack" as const,
      };

      const mockUserInfo = {
        id: "U1234567890",
        name: "john.doe",
        teamId: "T1234567890",
        teamName: "Test Team",
      };

      (getUserMessagingProvider as any).mockResolvedValue(mockProvider);
      (getSlackUserInfo as any).mockResolvedValue(mockUserInfo);

      const response = await app.request("/slack/user");

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUserInfo);
      expect(getUserMessagingProvider).toHaveBeenCalledWith(
        "test-user-id",
        "slack"
      );
      expect(getSlackUserInfo).toHaveBeenCalledWith("xoxb-test-token");
    });

    it("should return 404 when provider not connected", async () => {
      (getUserMessagingProvider as any).mockResolvedValue(null);

      const response = await app.request("/slack/user");

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe("Provider not connected");
    });
  });
});
