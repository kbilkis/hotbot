// Main provider module exports

// Type exports
export type {
  GitProvider,
  MessagingProvider,
  GitProviderType,
  MessagingProviderType,
  PRFilters,
  TokenResponse,
  PullRequest,
  Channel,
  ProviderConfig,
  OAuthState,
} from "../types/providers.js";

// Error exports
export {
  ProviderError,
  TokenExpiredError,
  RateLimitError,
} from "../types/providers.js";

// Base class exports
export {
  BaseGitProvider,
  BaseMessagingProvider,
  ProviderErrorHandler,
} from "./base.js";

// OAuth utility exports
export {
  OAuthStateManager,
  OAuthUrlBuilder,
  TokenExchanger,
  AuthenticatedHttpClient,
  RateLimiter,
  RetryHandler,
} from "./oauth.js";

// Factory exports
export {
  ProviderConfigRegistry,
  DefaultProviderFactory,
  providerFactory,
  ProviderUtils,
  ProviderHealthChecker,
} from "./factory.js";

// Import and re-export registerProviders function
import { registerProviders as _registerProviders } from "./factory.js";
export { registerProviders } from "./factory.js";

// Convenience functions for common operations
export async function getAuthUrl(
  providerType: GitProviderType | MessagingProviderType,
  state: string,
  redirectUri: string
): Promise<string> {
  if (ProviderUtils.isGitProvider(providerType)) {
    const provider = providerFactory.createGitProvider(providerType);
    return provider.getAuthUrl(state, redirectUri);
  } else if (ProviderUtils.isMessagingProvider(providerType)) {
    const provider = providerFactory.createMessagingProvider(providerType);
    return provider.getAuthUrl(state, redirectUri);
  } else {
    throw new Error(`Unknown provider type: ${providerType}`);
  }
}

export async function exchangeCodeForTokens(
  providerType: GitProviderType | MessagingProviderType,
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  if (ProviderUtils.isGitProvider(providerType)) {
    const provider = providerFactory.createGitProvider(providerType);
    return provider.exchangeCodeForTokens(code, redirectUri);
  } else if (ProviderUtils.isMessagingProvider(providerType)) {
    const provider = providerFactory.createMessagingProvider(providerType);
    return provider.exchangeCodeForTokens(code, redirectUri);
  } else {
    throw new Error(`Unknown provider type: ${providerType}`);
  }
}

export async function refreshProviderToken(
  providerType: GitProviderType | MessagingProviderType,
  refreshToken: string
): Promise<TokenResponse> {
  if (ProviderUtils.isGitProvider(providerType)) {
    const provider = providerFactory.createGitProvider(providerType);
    return provider.refreshToken(refreshToken);
  } else if (ProviderUtils.isMessagingProvider(providerType)) {
    const provider = providerFactory.createMessagingProvider(providerType);
    return provider.refreshToken(refreshToken);
  } else {
    throw new Error(`Unknown provider type: ${providerType}`);
  }
}

export async function validateProviderToken(
  providerType: GitProviderType | MessagingProviderType,
  token: string
): Promise<boolean> {
  try {
    if (ProviderUtils.isGitProvider(providerType)) {
      const provider = providerFactory.createGitProvider(providerType);
      return provider.validateToken(token);
    } else if (ProviderUtils.isMessagingProvider(providerType)) {
      const provider = providerFactory.createMessagingProvider(providerType);
      return provider.validateToken(token);
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

// Initialize providers on module load
_registerProviders();
