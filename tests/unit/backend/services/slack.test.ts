// Unit tests for Slack messaging provider integration

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Set environment variables before importing the module
process.env.SLACK_CLIENT_ID = "test_client_id";
process.env.SLACK_CLIENT_SECRET = "test_client_secret";

import {
  getSlackAuthUrl,
  exchangeSlackToken,
  getSlackChannels,
  sendSlackMessage,
  validateSlackToken,
  getSlackUserInfo,
  formatSlackPRMessage,
} from "../../../../src/lib/slack";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Slack Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getSlackAuthUrl", () => {
    it("should generate correct OAuth URL with default scopes", () => {
      const state = "test-state";
      const redirectUri = "http://localhost:3000/callback";

      const authUrl = getSlackAuthUrl(state, redirectUri);

      expect(authUrl).toContain("https://slack.com/oauth/v2/authorize");
      expect(authUrl).toContain("client_id=");
      expect(authUrl).toContain(
        "redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback"
      );
      expect(authUrl).toContain("state=test-state");
      expect(authUrl).toContain(
        "scope=channels%3Aread%2Cchat%3Awrite%2Cchat%3Awrite.public"
      );
    });

    it("should generate correct OAuth URL with custom scopes", () => {
      const state = "test-state";
      const redirectUri = "http://localhost:3000/callback";
      const scopes = ["channels:read", "chat:write"];

      const authUrl = getSlackAuthUrl(state, redirectUri, scopes);

      expect(authUrl).toContain("scope=channels%3Aread%2Cchat%3Awrite");
    });
  });

  describe("exchangeSlackToken", () => {
    it("should successfully exchange code for token", async () => {
      const mockResponse = {
        ok: true,
        access_token: "xoxb-test-token",
        refresh_token: "xoxe-refresh-token",
        expires_in: 3600,
        scope: "channels:read,chat:write",
        token_type: "Bearer",
        team: {
          id: "T1234567890",
          name: "Test Team",
        },
        authed_user: {
          id: "U1234567890",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await exchangeSlackToken(
        "test-code",
        "http://localhost:3000/callback"
      );

      expect(result).toEqual({
        accessToken: "xoxb-test-token",
        refreshToken: "xoxe-refresh-token",
        expiresAt: expect.any(Date),
        scope: "channels:read,chat:write",
        tokenType: "Bearer",
        teamId: "T1234567890",
        teamName: "Test Team",
        userId: "U1234567890",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://slack.com/api/oauth.v2.access",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
      );
    });

    it("should throw error on failed token exchange", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        exchangeSlackToken("invalid-code", "http://localhost:3000/callback")
      ).rejects.toThrow("Slack token exchange failed: 400");
    });

    it("should throw error on Slack API error response", async () => {
      const mockResponse = {
        ok: false,
        error: "invalid_code",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(
        exchangeSlackToken("invalid-code", "http://localhost:3000/callback")
      ).rejects.toThrow("Slack OAuth error: invalid_code");
    });
  });

  describe("getSlackChannels", () => {
    it("should fetch and format channels correctly", async () => {
      const publicChannelsResponse = {
        ok: true,
        channels: [
          {
            id: "C1234567890",
            name: "general",
            is_archived: false,
            is_member: true,
            num_members: 10,
          },
          {
            id: "C0987654321",
            name: "random",
            is_archived: false,
            is_member: true,
            num_members: 5,
          },
        ],
      };

      const privateChannelsResponse = {
        ok: true,
        channels: [
          {
            id: "G1234567890",
            name: "private-channel",
            is_archived: false,
            is_member: true,
            num_members: 3,
          },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(publicChannelsResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(privateChannelsResponse),
        });

      const channels = await getSlackChannels("test-token");

      expect(channels).toEqual([
        {
          id: "C1234567890",
          name: "general",
          type: "public",
          memberCount: 10,
          isArchived: false,
          isMember: true,
        },
        {
          id: "G1234567890",
          name: "private-channel",
          type: "private",
          memberCount: 3,
          isArchived: false,
          isMember: true,
        },
        {
          id: "C0987654321",
          name: "random",
          type: "public",
          memberCount: 5,
          isArchived: false,
          isMember: true,
        },
      ]);
    });

    it("should filter out archived channels", async () => {
      const publicChannelsResponse = {
        ok: true,
        channels: [
          {
            id: "C1234567890",
            name: "general",
            is_archived: false,
            is_member: true,
            num_members: 10,
          },
          {
            id: "C0987654321",
            name: "archived-channel",
            is_archived: true,
            is_member: true,
            num_members: 0,
          },
        ],
      };

      const privateChannelsResponse = {
        ok: true,
        channels: [],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(publicChannelsResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(privateChannelsResponse),
        });

      const channels = await getSlackChannels("test-token");

      expect(channels).toHaveLength(1);
      expect(channels[0].name).toBe("general");
    });
  });

  describe("sendSlackMessage", () => {
    it("should send simple text message", async () => {
      const mockResponse = {
        ok: true,
        ts: "1234567890.123456",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await sendSlackMessage("test-token", "C1234567890", "Hello, World!");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://slack.com/api/chat.postMessage",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel: "C1234567890",
            text: "Hello, World!",
          }),
        })
      );
    });

    it("should send structured message with blocks", async () => {
      const mockResponse = {
        ok: true,
        ts: "1234567890.123456",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const message = {
        channel: "C1234567890",
        text: "Fallback text",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Hello, *World*!",
            },
          },
        ],
      };

      await sendSlackMessage("test-token", "C1234567890", message);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://slack.com/api/chat.postMessage",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(message),
        })
      );
    });
  });

  describe("validateSlackToken", () => {
    it("should return true for valid token", async () => {
      const mockResponse = {
        ok: true,
        user_id: "U1234567890",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const isValid = await validateSlackToken("valid-token");

      expect(isValid).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://slack.com/api/auth.test",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer valid-token",
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should return false for invalid token", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Invalid token"));

      const isValid = await validateSlackToken("invalid-token");

      expect(isValid).toBe(false);
    });
  });

  describe("formatSlackPRMessage", () => {
    it("should format empty PR list correctly", () => {
      const message = formatSlackPRMessage([], "test-repo");

      expect(message.text).toBe("✅ No open pull requests found in test-repo");
      expect(message.channel).toBe("");
    });

    it("should format single PR correctly", () => {
      const pullRequests = [
        {
          id: "1",
          title: "Fix bug in authentication",
          author: "john.doe",
          url: "https://github.com/test/repo/pull/1",
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(), // 2 days ago
          updatedAt: new Date().toISOString(),
          repository: "test/repo",
          labels: ["bug", "high-priority"],
          tags: ["HOTFIX"],
          status: "open",
          hasApprovals: false,
          hasChangesRequested: false,
        },
      ];

      const message = formatSlackPRMessage(pullRequests);

      expect(message.text).toContain("📋 *Open Pull Requests* (1)");
      expect(message.blocks).toBeDefined();
      expect(message.blocks![0].type).toBe("header");

      // Check that PR details are included
      const prSection = message.blocks!.find(
        (block) =>
          block.type === "section" &&
          block.text?.text?.includes("Fix bug in authentication")
      );
      expect(prSection).toBeDefined();
      expect(prSection.text.text).toContain("john.doe");
      expect(prSection.text.text).toContain("2 days");
    });

    it("should format escalation message correctly", () => {
      const pullRequests = [
        {
          id: "1",
          title: "Old PR needs attention",
          author: "jane.doe",
          url: "https://github.com/test/repo/pull/1",
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(), // 5 days ago
          updatedAt: new Date().toISOString(),
          repository: "test/repo",
          labels: [],
          tags: [],
          status: "open",
          hasApprovals: false,
          hasChangesRequested: false,
        },
      ];

      const message = formatSlackPRMessage(pullRequests, undefined, true);

      expect(message.text).toContain("🚨 *Escalated Pull Requests* (1)");
      expect(message.blocks).toBeDefined();

      // Check for escalation indicators
      const prSection = message.blocks!.find(
        (block) => block.type === "section" && block.text?.text?.includes("🚨")
      );
      expect(prSection).toBeDefined();

      // Check for escalation context
      const contextSection = message.blocks!.find(
        (block) =>
          block.type === "context" &&
          block.elements?.[0]?.text?.includes("escalation threshold")
      );
      expect(contextSection).toBeDefined();
    });

    it("should handle PR with approvals and changes requested", () => {
      const pullRequests = [
        {
          id: "1",
          title: "Feature implementation",
          author: "developer",
          url: "https://github.com/test/repo/pull/1",
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 day ago
          updatedAt: new Date().toISOString(),
          repository: "test/repo",
          labels: ["feature"],
          tags: [],
          status: "open",
          hasApprovals: true,
          hasChangesRequested: false,
          reviewers: ["reviewer1", "reviewer2"],
        },
      ];

      const message = formatSlackPRMessage(pullRequests);

      const prSection = message.blocks!.find(
        (block) =>
          block.type === "section" &&
          block.text?.text?.includes("Feature implementation")
      );
      expect(prSection).toBeDefined();
      expect(prSection.text.text).toContain("✅"); // Approved emoji
      expect(prSection.text.text).toContain("(Approved)");
    });
  });

  describe("getSlackUserInfo", () => {
    it("should fetch user info correctly", async () => {
      const mockResponse = {
        ok: true,
        user_id: "U1234567890",
        user: "john.doe",
        team_id: "T1234567890",
        team: "Test Team",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const userInfo = await getSlackUserInfo("test-token");

      expect(userInfo).toEqual({
        id: "U1234567890",
        name: "john.doe",
        teamId: "T1234567890",
        teamName: "Test Team",
      });
    });
  });
});
