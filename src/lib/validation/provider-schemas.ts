// arktype validation schemas for provider operations

import { type } from "arktype";

// OAuth state validation
export const OAuthStateSchema = type({
  state: "string",
  provider: "'github'|'bitbucket'|'gitlab'|'slack'|'teams'|'discord'",
  userId: "string",
  redirectUri: "string",
});

// OAuth callback validation
export const OAuthCallbackSchema = type({
  code: "string",
  state: "string?",
  error: "string?",
  error_description: "string?",
});

// Provider connection request
export const ConnectProviderSchema = type({
  redirectUri: "string",
});

// GitHub specific schemas
export const GitHubAuthUrlSchema = type({
  redirectUri: "string",
  scopes: "string[]?",
});

export const GitHubTokenExchangeSchema = type({
  code: "string",
  redirectUri: "string",
});

export const GitHubPRFiltersSchema = type({
  repositories: "string[]?",
  labels: "string[]?",
  tags: "string[]?",
  titleKeywords: "string[]?",
  excludeAuthors: "string[]?",
  minAge: "number?",
  maxAge: "number?",
});

export const GitHubFetchPRsSchema = type({
  repositories: "string[]?",
  "filters?": GitHubPRFiltersSchema,
});

// Response schemas
export const AuthUrlResponseSchema = type({
  authUrl: "string",
  state: "string",
});

export const TokenResponseSchema = type({
  accessToken: "string",
  refreshToken: "string?",
  expiresAt: "string?", // ISO date string
  scope: "string?",
  tokenType: "string?",
});

export const PullRequestSchema = type({
  id: "string",
  title: "string",
  author: "string",
  url: "string",
  createdAt: "string", // ISO date string
  updatedAt: "string", // ISO date string
  repository: "string",
  labels: "string[]",
  tags: "string[]",
  status: "'open'|'closed'|'merged'",
  reviewers: "string[]?",
  assignees: "string[]?",
});

export const RepositorySchema = type({
  name: "string",
  fullName: "string",
  private: "boolean",
  url: "string",
});

// Error response schema
export const ErrorResponseSchema = type({
  error: "string",
  message: "string?",
  code: "string?",
  details: "unknown?",
});

// Success response schema
export const SuccessResponseSchema = type({
  success: "boolean",
  message: "string?",
  data: "unknown?",
});

// Provider status schema
export const ProviderStatusSchema = type({
  id: "number",
  type: "'github'|'bitbucket'|'gitlab'|'slack'|'teams'|'discord'",
  name: "string",
  connected: "boolean",
  connectedAt: "string?", // ISO date string
  lastSync: "string?", // ISO date string
  repositories: "string[]?",
  channels: "string[]?",
});

// Git provider schemas
export const GitProviderTypeSchema = type("'github'|'bitbucket'|'gitlab'");

export const GitProviderSchema = type({
  id: "number",
  provider: GitProviderTypeSchema,
  name: "string",
  connected: "boolean",
  connectedAt: "string?", // ISO date string
  repositories: "string[]?",
});

export const GitProvidersListSchema = type({
  providers: GitProviderSchema.array(),
});

export const GitProviderResponseSchema = type({
  success: "boolean",
  message: "string?",
  data: GitProvidersListSchema,
});

// Extract TypeScript types from arktype schemas
export type OAuthStateData = typeof OAuthStateSchema.infer;
export type OAuthCallbackData = typeof OAuthCallbackSchema.infer;
export type ConnectProviderData = typeof ConnectProviderSchema.infer;
export type GitHubAuthUrlData = typeof GitHubAuthUrlSchema.infer;
export type GitHubTokenExchangeData = typeof GitHubTokenExchangeSchema.infer;
export type GitHubPRFiltersData = typeof GitHubPRFiltersSchema.infer;
export type GitHubFetchPRsData = typeof GitHubFetchPRsSchema.infer;
export type AuthUrlResponseData = typeof AuthUrlResponseSchema.infer;
export type TokenResponseData = typeof TokenResponseSchema.infer;
export type PullRequestData = typeof PullRequestSchema.infer;
export type RepositoryData = typeof RepositorySchema.infer;
export type ErrorResponseData = typeof ErrorResponseSchema.infer;
export type SuccessResponseData = typeof SuccessResponseSchema.infer;
export type ProviderStatusData = typeof ProviderStatusSchema.infer;
export type GitProviderTypeData = typeof GitProviderTypeSchema.infer;
export type GitProviderData = typeof GitProviderSchema.infer;
export type GitProvidersListData = typeof GitProvidersListSchema.infer;
export type GitProviderResponseData = typeof GitProviderResponseSchema.infer;
