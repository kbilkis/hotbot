// Token management utilities with automatic refresh and error handling

import type {
  GitProviderType,
  MessagingProviderType,
  TokenResponse,
} from "../types/providers.js";

import {
  TokenExpiredError,
  RateLimitError,
  ProviderError,
} from "../types/providers.js";

import {
  providerFactory,
  ProviderErrorHandler,
  RetryHandler,
} from "./index.js";

// Token storage interface (to be implemented by database layer)
export interface TokenStorage {
  getToken(
    userId: string,
    providerType: string,
    providerId: number
  ): Promise<TokenData | null>;
  saveToken(
    userId: string,
    providerType: string,
    providerId: number,
    tokenData: TokenData
  ): Promise<void>;
  deleteToken(
    userId: string,
    providerType: string,
    providerId: number
  ): Promise<void>;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  tokenType?: string;
}

// Token manager with automatic refresh capabilities
export class TokenManager {
  constructor(private tokenStorage: TokenStorage) {}

  async getValidToken(
    userId: string,
    providerType: GitProviderType | MessagingProviderType,
    providerId: number
  ): Promise<string> {
    const tokenData = await this.tokenStorage.getToken(
      userId,
      providerType,
      providerId
    );

    if (!tokenData) {
      throw new ProviderError(
        `No token found for ${providerType} provider`,
        providerType,
        "NO_TOKEN"
      );
    }

    // Check if token is expired
    if (this.isTokenExpired(tokenData)) {
      if (!tokenData.refreshToken) {
        throw new TokenExpiredError(providerType);
      }

      // Attempt to refresh the token
      try {
        const newTokenData = await this.refreshToken(
          userId,
          providerType,
          providerId,
          tokenData.refreshToken
        );
        return newTokenData.accessToken;
      } catch (error) {
        // If refresh fails, delete the invalid token
        await this.tokenStorage.deleteToken(userId, providerType, providerId);
        throw new TokenExpiredError(providerType);
      }
    }

    return tokenData.accessToken;
  }

  async saveToken(
    userId: string,
    providerType: GitProviderType | MessagingProviderType,
    providerId: number,
    tokenResponse: TokenResponse
  ): Promise<void> {
    const tokenData: TokenData = {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresAt: tokenResponse.expiresAt,
      scope: tokenResponse.scope,
      tokenType: tokenResponse.tokenType,
    };

    await this.tokenStorage.saveToken(
      userId,
      providerType,
      providerId,
      tokenData
    );
  }

  async refreshToken(
    userId: string,
    providerType: GitProviderType | MessagingProviderType,
    providerId: number,
    refreshToken: string
  ): Promise<TokenData> {
    const provider = this.createProvider(providerType);

    const tokenResponse = await RetryHandler.withRetry(async () => {
      return provider.refreshToken(refreshToken);
    });

    const tokenData: TokenData = {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken || refreshToken, // Keep old refresh token if new one not provided
      expiresAt: tokenResponse.expiresAt,
      scope: tokenResponse.scope,
      tokenType: tokenResponse.tokenType,
    };

    await this.tokenStorage.saveToken(
      userId,
      providerType,
      providerId,
      tokenData
    );

    return tokenData;
  }

  async deleteToken(
    userId: string,
    providerType: GitProviderType | MessagingProviderType,
    providerId: number
  ): Promise<void> {
    await this.tokenStorage.deleteToken(userId, providerType, providerId);
  }

  async validateToken(
    userId: string,
    providerType: GitProviderType | MessagingProviderType,
    providerId: number
  ): Promise<boolean> {
    try {
      const token = await this.getValidToken(userId, providerType, providerId);
      const provider = this.createProvider(providerType);
      return await provider.validateToken(token);
    } catch {
      return false;
    }
  }

  private isTokenExpired(tokenData: TokenData): boolean {
    if (!tokenData.expiresAt) {
      return false; // No expiration time, assume it's valid
    }

    // Add 5 minute buffer to prevent edge cases
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return new Date().getTime() > tokenData.expiresAt.getTime() - bufferTime;
  }

  private createProvider(
    providerType: GitProviderType | MessagingProviderType
  ) {
    if (["github", "bitbucket", "gitlab"].includes(providerType)) {
      return providerFactory.createGitProvider(providerType as GitProviderType);
    } else {
      return providerFactory.createMessagingProvider(
        providerType as MessagingProviderType
      );
    }
  }
}

// Authenticated operation wrapper
export class AuthenticatedOperationManager {
  constructor(private tokenManager: TokenManager) {}

  async executeWithToken<T>(
    userId: string,
    providerType: GitProviderType | MessagingProviderType,
    providerId: number,
    operation: (token: string) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const token = await this.tokenManager.getValidToken(
          userId,
          providerType,
          providerId
        );
        return await operation(token);
      } catch (error) {
        lastError = error as Error;

        // If token expired, try to refresh and retry
        if (ProviderErrorHandler.shouldRefreshToken(error as Error)) {
          try {
            const tokenData = await this.tokenManager.tokenStorage.getToken(
              userId,
              providerType,
              providerId
            );
            if (tokenData?.refreshToken) {
              await this.tokenManager.refreshToken(
                userId,
                providerType,
                providerId,
                tokenData.refreshToken
              );
              continue; // Retry with new token
            }
          } catch (refreshError) {
            // If refresh fails, delete the token and throw original error
            await this.tokenManager.deleteToken(
              userId,
              providerType,
              providerId
            );
            throw new TokenExpiredError(providerType);
          }
        }

        // If it's a retryable error, wait and retry
        if (ProviderErrorHandler.isRetryableError(error as Error)) {
          if (attempt < maxRetries - 1) {
            const delay = ProviderErrorHandler.getRetryDelay(error as Error);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // If it's not retryable or we've exhausted retries, throw the error
        throw error;
      }
    }

    throw lastError!;
  }
}

// Token health monitoring
export class TokenHealthMonitor {
  constructor(private tokenManager: TokenManager) {}

  async checkTokenHealth(
    userId: string,
    providerType: GitProviderType | MessagingProviderType,
    providerId: number
  ): Promise<{
    isValid: boolean;
    isExpired: boolean;
    needsRefresh: boolean;
    error?: string;
  }> {
    try {
      const tokenData = await this.tokenManager.tokenStorage.getToken(
        userId,
        providerType,
        providerId
      );

      if (!tokenData) {
        return {
          isValid: false,
          isExpired: false,
          needsRefresh: false,
          error: "No token found",
        };
      }

      const isExpired = this.isTokenExpired(tokenData);
      const needsRefresh = isExpired && !!tokenData.refreshToken;

      if (isExpired && !tokenData.refreshToken) {
        return {
          isValid: false,
          isExpired: true,
          needsRefresh: false,
          error: "Token expired and no refresh token available",
        };
      }

      // If token is not expired, validate it with the provider
      if (!isExpired) {
        const isValid = await this.tokenManager.validateToken(
          userId,
          providerType,
          providerId
        );
        return {
          isValid,
          isExpired: false,
          needsRefresh: false,
          error: isValid ? undefined : "Token validation failed",
        };
      }

      return {
        isValid: false,
        isExpired: true,
        needsRefresh: true,
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: false,
        needsRefresh: false,
        error: (error as Error).message,
      };
    }
  }

  private isTokenExpired(tokenData: TokenData): boolean {
    if (!tokenData.expiresAt) {
      return false;
    }

    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    return new Date().getTime() > tokenData.expiresAt.getTime() - bufferTime;
  }
}
