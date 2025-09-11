// Base provider classes with common functionality

import type {
  GitProvider,
  MessagingProvider,
  GitProviderType,
  MessagingProviderType,
  TokenResponse,
  PullRequest,
  Channel,
  PRFilters,
  ProviderConfig,
  ProviderError,
  TokenExpiredError,
  RateLimitError,
} from "../types/providers.js";

import {
  OAuthUrlBuilder,
  TokenExchanger,
  AuthenticatedHttpClient,
  RateLimiter,
  RetryHandler,
} from "./oauth.js";

// Base Git Provider implementation
export abstract class BaseGitProvider implements GitProvider {
  abstract readonly name: GitProviderType;
  protected abstract readonly config: ProviderConfig;
  protected abstract readonly authUrl: string;
  protected abstract readonly tokenUrl: string;
  protected abstract readonly apiBaseUrl: string;

  protected rateLimiter = new RateLimiter(60, 60 * 1000); // 60 requests per minute

  getAuthUrl(state: string, redirectUri: string): string {
    return OAuthUrlBuilder.buildAuthUrl(
      this.authUrl,
      this.config.clientId,
      redirectUri,
      this.config.scopes,
      state
    );
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<TokenResponse> {
    return RetryHandler.withRetry(async () => {
      return TokenExchanger.exchangeCodeForTokens(
        this.tokenUrl,
        this.config.clientId,
        this.config.clientSecret,
        code,
        redirectUri
      );
    });
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return RetryHandler.withRetry(async () => {
      return TokenExchanger.refreshAccessToken(
        this.tokenUrl,
        this.config.clientId,
        this.config.clientSecret,
        refreshToken
      );
    });
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.apiBaseUrl}/user`,
        token
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  protected async makeAuthenticatedRequest(
    url: string,
    token: string,
    options: RequestInit = {}
  ): Promise<Response> {
    await this.rateLimiter.waitForSlot(this.name);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "User-Agent": "git-messaging-scheduler/1.0",
        Accept: "application/json",
      },
    });

    if (response.status === 401) {
      throw new TokenExpiredError(this.name);
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      throw new RateLimitError(
        this.name,
        retryAfter ? parseInt(retryAfter) : undefined
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new ProviderError(
        `API request failed: ${errorText}`,
        this.name,
        "API_ERROR",
        response.status
      );
    }

    return response;
  }

  protected applyFilters(
    pullRequests: PullRequest[],
    filters?: PRFilters
  ): PullRequest[] {
    if (!filters) return pullRequests;

    return pullRequests.filter((pr) => {
      // Filter by repositories
      if (filters.repositories && filters.repositories.length > 0) {
        if (!filters.repositories.includes(pr.repository)) {
          return false;
        }
      }

      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) =>
          pr.tags.some((prTag) =>
            prTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }

      // Filter by labels
      if (filters.labels && filters.labels.length > 0) {
        const hasMatchingLabel = filters.labels.some((label) =>
          pr.labels.some((prLabel) =>
            prLabel.toLowerCase().includes(label.toLowerCase())
          )
        );
        if (!hasMatchingLabel) return false;
      }

      // Filter by title keywords
      if (filters.titleKeywords && filters.titleKeywords.length > 0) {
        const hasMatchingKeyword = filters.titleKeywords.some((keyword) =>
          pr.title.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasMatchingKeyword) return false;
      }

      // Filter by excluded authors
      if (filters.excludeAuthors && filters.excludeAuthors.length > 0) {
        if (filters.excludeAuthors.includes(pr.author)) {
          return false;
        }
      }

      // Filter by age
      const prAgeInDays =
        (Date.now() - pr.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (filters.minAge !== undefined && prAgeInDays < filters.minAge) {
        return false;
      }

      if (filters.maxAge !== undefined && prAgeInDays > filters.maxAge) {
        return false;
      }

      return true;
    });
  }

  // Abstract methods to be implemented by specific providers
  abstract getPullRequests(
    token: string,
    repositories?: string[],
    filters?: PRFilters
  ): Promise<PullRequest[]>;

  abstract getRepositories(token: string): Promise<string[]>;
}

// Base Messaging Provider implementation
export abstract class BaseMessagingProvider implements MessagingProvider {
  abstract readonly name: MessagingProviderType;
  protected abstract readonly config: ProviderConfig;
  protected abstract readonly authUrl: string;
  protected abstract readonly tokenUrl: string;
  protected abstract readonly apiBaseUrl: string;

  protected rateLimiter = new RateLimiter(50, 60 * 1000); // 50 requests per minute

  getAuthUrl(state: string, redirectUri: string): string {
    return OAuthUrlBuilder.buildAuthUrl(
      this.authUrl,
      this.config.clientId,
      redirectUri,
      this.config.scopes,
      state
    );
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<TokenResponse> {
    return RetryHandler.withRetry(async () => {
      return TokenExchanger.exchangeCodeForTokens(
        this.tokenUrl,
        this.config.clientId,
        this.config.clientSecret,
        code,
        redirectUri
      );
    });
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return RetryHandler.withRetry(async () => {
      return TokenExchanger.refreshAccessToken(
        this.tokenUrl,
        this.config.clientId,
        this.config.clientSecret,
        refreshToken
      );
    });
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.apiBaseUrl}/auth.test`,
        token
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  protected async makeAuthenticatedRequest(
    url: string,
    token: string,
    options: RequestInit = {}
  ): Promise<Response> {
    await this.rateLimiter.waitForSlot(this.name);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (response.status === 401) {
      throw new TokenExpiredError(this.name);
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      throw new RateLimitError(
        this.name,
        retryAfter ? parseInt(retryAfter) : undefined
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new ProviderError(
        `API request failed: ${errorText}`,
        this.name,
        "API_ERROR",
        response.status
      );
    }

    return response;
  }

  protected formatPullRequestMessage(
    pullRequests: PullRequest[],
    isEscalation = false
  ): string {
    if (pullRequests.length === 0) {
      return "✅ No open pull requests found!";
    }

    const header = isEscalation
      ? `🚨 **ESCALATION** - ${pullRequests.length} pull request(s) need attention:`
      : `📋 ${pullRequests.length} open pull request(s):`;

    const prList = pullRequests
      .map((pr) => {
        const age = Math.floor(
          (Date.now() - pr.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const ageText =
          age === 0 ? "today" : `${age} day${age > 1 ? "s" : ""} ago`;

        let line = `• **${pr.title}** by ${pr.author} (${ageText})`;

        if (pr.labels.length > 0) {
          line += ` [${pr.labels.join(", ")}]`;
        }

        line += `\n  ${pr.url}`;

        return line;
      })
      .join("\n\n");

    return `${header}\n\n${prList}`;
  }

  // Abstract methods to be implemented by specific providers
  abstract sendMessage(
    token: string,
    channel: string,
    message: string
  ): Promise<void>;
  abstract getChannels(token: string): Promise<Channel[]>;
}

// Provider factory interface
export interface ProviderFactory {
  createGitProvider(type: GitProviderType): GitProvider;
  createMessagingProvider(type: MessagingProviderType): MessagingProvider;
}

// Error handling utilities
export class ProviderErrorHandler {
  static isRetryableError(error: Error): boolean {
    return (
      error instanceof RateLimitError ||
      (error instanceof ProviderError &&
        error.statusCode &&
        error.statusCode >= 500)
    );
  }

  static shouldRefreshToken(error: Error): boolean {
    return error instanceof TokenExpiredError;
  }

  static getRetryDelay(error: Error): number {
    if (error instanceof RateLimitError && error.retryAfter) {
      return error.retryAfter * 1000; // Convert to milliseconds
    }

    return 5000; // Default 5 second delay
  }
}
