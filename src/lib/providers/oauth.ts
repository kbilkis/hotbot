// OAuth flow utilities for provider authentication

import crypto from "crypto";
import type {
  GitProviderType,
  MessagingProviderType,
  OAuthState,
  TokenResponse,
  ProviderConfig,
} from "../types/providers.js";

// OAuth state storage (in production, use Redis or database)
const oauthStates = new Map<string, OAuthState>();

// CSRF state generation and validation
export class OAuthStateManager {
  static generateState(
    provider: GitProviderType | MessagingProviderType,
    userId: string,
    redirectUri: string
  ): string {
    const state = crypto.randomUUID();

    oauthStates.set(state, {
      state,
      provider,
      userId,
      redirectUri,
      createdAt: new Date(),
    });

    // Clean up expired states (older than 10 minutes)
    this.cleanupExpiredStates();

    return state;
  }

  static validateState(state: string): OAuthState | null {
    const stateData = oauthStates.get(state);

    if (!stateData) {
      return null;
    }

    // Check if state is expired (10 minutes)
    const expirationTime = new Date(
      stateData.createdAt.getTime() + 10 * 60 * 1000
    );
    if (new Date() > expirationTime) {
      oauthStates.delete(state);
      return null;
    }

    // Remove state after validation to prevent reuse
    oauthStates.delete(state);

    return stateData;
  }

  private static cleanupExpiredStates(): void {
    const now = new Date();
    const expirationThreshold = 10 * 60 * 1000; // 10 minutes

    for (const [state, stateData] of oauthStates.entries()) {
      if (now.getTime() - stateData.createdAt.getTime() > expirationThreshold) {
        oauthStates.delete(state);
      }
    }
  }
}

// OAuth URL builder utility
export class OAuthUrlBuilder {
  static buildAuthUrl(
    baseUrl: string,
    clientId: string,
    redirectUri: string,
    scopes: string[],
    state: string,
    additionalParams?: Record<string, string>
  ): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(" "),
      state,
      response_type: "code",
      ...additionalParams,
    });

    return `${baseUrl}?${params.toString()}`;
  }
}

// Token exchange utility
export class TokenExchanger {
  static async exchangeCodeForTokens(
    tokenUrl: string,
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string,
    additionalParams?: Record<string, string>
  ): Promise<TokenResponse> {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      ...additionalParams,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope,
      tokenType: data.token_type || "Bearer",
    };
  }

  static async refreshAccessToken(
    tokenUrl: string,
    clientId: string,
    clientSecret: string,
    refreshToken: string,
    additionalParams?: Record<string, string>
  ): Promise<TokenResponse> {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      ...additionalParams,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Some providers don't return new refresh token
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000)
        : undefined,
      scope: data.scope,
      tokenType: data.token_type || "Bearer",
    };
  }
}

// HTTP client with automatic token refresh
export class AuthenticatedHttpClient {
  constructor(
    private getToken: () => Promise<string>,
    private refreshTokenFn?: () => Promise<string>
  ) {}

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    // If token expired and we have refresh capability, try once more
    if (response.status === 401 && this.refreshTokenFn) {
      try {
        const newToken = await this.refreshTokenFn();

        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } catch (refreshError) {
        // If refresh fails, return original 401 response
        return response;
      }
    }

    return response;
  }
}

// Rate limiting utility
export class RateLimiter {
  private requests = new Map<string, number[]>();

  constructor(private maxRequests: number, private windowMs: number) {}

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this key
    const keyRequests = this.requests.get(key) || [];

    // Filter out requests outside the window
    const validRequests = keyRequests.filter((time) => time > windowStart);

    // Check if we're at the limit
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  async waitForSlot(key: string): Promise<void> {
    while (!(await this.checkLimit(key))) {
      // Wait 1 second before trying again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// Retry utility with exponential backoff
export class RetryHandler {
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}
