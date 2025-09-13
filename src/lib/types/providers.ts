// Provider interface types for git and messaging providers

export type GitProviderType = "github" | "bitbucket" | "gitlab";
export type MessagingProviderType = "slack" | "teams" | "discord";

// Pull request filtering interface
export interface PRFilters {
  labels?: string[];
  titleKeywords?: string[];
  excludeAuthors?: string[];
  repositories?: string[];
  minAge?: number; // days
  maxAge?: number; // days
}

// OAuth token response interface
export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  tokenType?: string;
}

// Pull request data structure
export interface PullRequest {
  id: string;
  title: string;
  author: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  repository: string;
  labels: string[];
  status: "open" | "closed" | "merged";
  reviewers?: string[];
  assignees?: string[];
}

// Channel/room information for messaging providers
export interface Channel {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
  memberCount?: number;
}

// Provider error types
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export class TokenExpiredError extends ProviderError {
  constructor(provider: string) {
    super(`Token expired for ${provider}`, provider, "TOKEN_EXPIRED", 401);
    this.name = "TokenExpiredError";
  }
}

export class RateLimitError extends ProviderError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${provider}`, provider, "RATE_LIMIT", 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }

  retryAfter?: number;
}

// Abstract Git Provider interface
export interface GitProvider {
  readonly name: GitProviderType;

  // OAuth flow methods
  getAuthUrl(state: string, redirectUri: string): string;
  exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<TokenResponse>;
  refreshToken(refreshToken: string): Promise<TokenResponse>;

  // API methods
  getPullRequests(
    token: string,
    repositories?: string[],
    filters?: PRFilters
  ): Promise<PullRequest[]>;

  getRepositories(token: string): Promise<string[]>;

  // Token validation
  validateToken(token: string): Promise<boolean>;
}

// Abstract Messaging Provider interface
export interface MessagingProvider {
  readonly name: MessagingProviderType;

  // OAuth flow methods
  getAuthUrl(state: string, redirectUri: string): string;
  exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<TokenResponse>;
  refreshToken(refreshToken: string): Promise<TokenResponse>;

  // API methods
  sendMessage(token: string, channel: string, message: string): Promise<void>;
  getChannels(token: string): Promise<Channel[]>;

  // Token validation
  validateToken(token: string): Promise<boolean>;
}

// Provider configuration interface
export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  baseUrl?: string;
}

// OAuth state management
export interface OAuthState {
  state: string;
  provider: GitProviderType | MessagingProviderType;
  userId: string;
  redirectUri: string;
  createdAt: Date;
}
