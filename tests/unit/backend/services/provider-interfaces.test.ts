// Unit tests for provider interfaces and utilities

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  BaseGitProvider,
  BaseMessagingProvider,
  OAuthStateManager,
  OAuthUrlBuilder,
  TokenExchanger,
  RateLimiter,
  RetryHandler,
  ProviderUtils,
  ProviderConfigRegistry,
  DefaultProviderFactory,
} from "../../../../src/lib/providers/index.js";

import type {
  GitProviderType,
  MessagingProviderType,
  ProviderConfig,
  TokenResponse,
  PullRequest,
  Channel,
  PRFilters,
} from "../../../../src/lib/types/providers.js";

// Mock implementations for testing
class MockGitProvider extends BaseGitProvider {
  readonly name: GitProviderType = "github";
  protected readonly config: ProviderConfig = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    scopes: ["repo", "read:user"],
  };
  protected readonly authUrl = "https://github.com/login/oauth/authorize";
  protected readonly tokenUrl = "https://github.com/login/oauth/access_token";
  protected readonly apiBaseUrl = "https://api.github.com";

  async getPullRequests(
    token: string,
    repositories?: string[],
    filters?: PRFilters
  ): Promise<PullRequest[]> {
    const mockPRs: PullRequest[] = [
      {
        id: "1",
        title: "Test PR",
        author: "testuser",
        url: "https://github.com/test/repo/pull/1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        repository: "test/repo",
        labels: ["bug", "urgent"],
        tags: ["hotfix"],
        status: "open",
      },
    ];

    return this.applyFilters(mockPRs, filters);
  }

  async getRepositories(token: string): Promise<string[]> {
    return ["test/repo1", "test/repo2"];
  }
}

class MockMessagingProvider extends BaseMessagingProvider {
  readonly name: MessagingProviderType = "slack";
  protected readonly config: ProviderConfig = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    scopes: ["chat:write", "channels:read"],
  };
  protected readonly authUrl = "https://slack.com/oauth/v2/authorize";
  protected readonly tokenUrl = "https://slack.com/api/oauth.v2.access";
  protected readonly apiBaseUrl = "https://slack.com/api";

  async sendMessage(
    token: string,
    channel: string,
    message: string
  ): Promise<void> {
    // Mock implementation
  }

  async getChannels(token: string): Promise<Channel[]> {
    return [
      {
        id: "C1234567890",
        name: "general",
        type: "public",
        memberCount: 10,
      },
    ];
  }
}

describe("Provider Interfaces", () => {
  describe("OAuthStateManager", () => {
    it("should generate and validate state correctly", () => {
      const state = OAuthStateManager.generateState(
        "github",
        "user123",
        "http://localhost/callback"
      );
      expect(state).toBeDefined();
      expect(typeof state).toBe("string");

      const stateData = OAuthStateManager.validateState(state);
      expect(stateData).toBeDefined();
      expect(stateData?.provider).toBe("github");
      expect(stateData?.userId).toBe("user123");

      // State should be consumed after validation
      const secondValidation = OAuthStateManager.validateState(state);
      expect(secondValidation).toBeNull();
    });

    it("should reject invalid state", () => {
      const invalidState = OAuthStateManager.validateState("invalid-state");
      expect(invalidState).toBeNull();
    });
  });

  describe("OAuthUrlBuilder", () => {
    it("should build correct OAuth URL", () => {
      const url = OAuthUrlBuilder.buildAuthUrl(
        "https://github.com/login/oauth/authorize",
        "client123",
        "http://localhost/callback",
        ["repo", "read:user"],
        "state123"
      );

      expect(url).toContain("https://github.com/login/oauth/authorize");
      expect(url).toContain("client_id=client123");
      expect(url).toContain("redirect_uri=http%3A%2F%2Flocalhost%2Fcallback");
      expect(url).toContain("scope=repo+read%3Auser");
      expect(url).toContain("state=state123");
      expect(url).toContain("response_type=code");
    });
  });

  describe("RateLimiter", () => {
    it("should allow requests within limit", async () => {
      const limiter = new RateLimiter(5, 1000); // 5 requests per second

      for (let i = 0; i < 5; i++) {
        const allowed = await limiter.checkLimit("test-key");
        expect(allowed).toBe(true);
      }

      // 6th request should be denied
      const denied = await limiter.checkLimit("test-key");
      expect(denied).toBe(false);
    });
  });

  describe("RetryHandler", () => {
    it("should retry failed operations", async () => {
      let attempts = 0;
      const operation = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error("Temporary failure");
        }
        return "success";
      });

      const result = await RetryHandler.withRetry(operation, 3, 10);
      expect(result).toBe("success");
      expect(attempts).toBe(3);
    });

    it("should throw after max retries", async () => {
      const operation = vi.fn(async () => {
        throw new Error("Persistent failure");
      });

      await expect(RetryHandler.withRetry(operation, 2, 10)).rejects.toThrow(
        "Persistent failure"
      );
    });
  });

  describe("ProviderUtils", () => {
    it("should correctly identify provider types", () => {
      expect(ProviderUtils.isGitProvider("github")).toBe(true);
      expect(ProviderUtils.isGitProvider("slack")).toBe(false);
      expect(ProviderUtils.isMessagingProvider("slack")).toBe(true);
      expect(ProviderUtils.isMessagingProvider("github")).toBe(false);
    });

    it("should return correct display names", () => {
      expect(ProviderUtils.getProviderDisplayName("github")).toBe("GitHub");
      expect(ProviderUtils.getProviderDisplayName("slack")).toBe("Slack");
      expect(ProviderUtils.getProviderDisplayName("teams")).toBe(
        "Microsoft Teams"
      );
    });
  });

  describe("BaseGitProvider", () => {
    let provider: MockGitProvider;

    beforeEach(() => {
      provider = new MockGitProvider();
    });

    it("should generate auth URL", () => {
      const url = provider.getAuthUrl("state123", "http://localhost/callback");
      expect(url).toContain("https://github.com/login/oauth/authorize");
      expect(url).toContain("state=state123");
    });

    it("should apply PR filters correctly", async () => {
      const prs = await provider.getPullRequests("token", undefined, {
        labels: ["urgent"],
      });

      expect(prs).toHaveLength(1);
      expect(prs[0].labels).toContain("urgent");
    });

    it("should filter out PRs that don't match criteria", async () => {
      const prs = await provider.getPullRequests("token", undefined, {
        labels: ["feature"], // This label doesn't exist in mock data
      });

      expect(prs).toHaveLength(0);
    });
  });

  describe("BaseMessagingProvider", () => {
    let provider: MockMessagingProvider;

    beforeEach(() => {
      provider = new MockMessagingProvider();
    });

    it("should generate auth URL", () => {
      const url = provider.getAuthUrl("state123", "http://localhost/callback");
      expect(url).toContain("https://slack.com/oauth/v2/authorize");
      expect(url).toContain("state=state123");
    });

    it("should get channels", async () => {
      const channels = await provider.getChannels("token");
      expect(channels).toHaveLength(1);
      expect(channels[0].name).toBe("general");
    });
  });

  describe("ProviderConfigRegistry", () => {
    beforeEach(() => {
      // Clear any existing configs
      vi.clearAllMocks();
    });

    it("should register and retrieve git provider config", () => {
      const config: ProviderConfig = {
        clientId: "test-id",
        clientSecret: "test-secret",
        scopes: ["repo"],
      };

      ProviderConfigRegistry.registerGitProvider("github", config);
      const retrieved = ProviderConfigRegistry.getGitConfig("github");

      expect(retrieved).toEqual(config);
    });

    it("should throw error for unregistered provider", () => {
      expect(() => {
        ProviderConfigRegistry.getGitConfig("bitbucket" as GitProviderType);
      }).toThrow("Git provider bitbucket not configured");
    });
  });

  describe("DefaultProviderFactory", () => {
    let factory: DefaultProviderFactory;

    beforeEach(() => {
      factory = new DefaultProviderFactory();
    });

    it("should register and create providers", () => {
      factory.registerGitProvider("github", () => new MockGitProvider());

      const provider = factory.createGitProvider("github");
      expect(provider).toBeInstanceOf(MockGitProvider);
      expect(provider.name).toBe("github");
    });

    it("should throw error for unregistered provider", () => {
      expect(() => {
        factory.createGitProvider("bitbucket");
      }).toThrow("Git provider bitbucket not registered");
    });
  });
});
