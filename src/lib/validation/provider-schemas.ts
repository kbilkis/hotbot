// arktype validation schemas for provider operations

import { type } from "arktype";

// GitHub specific schemas
export const GitHubAuthUrlSchema = type({
  redirectUri: "string",
  scopes: "string[]?",
});

export const GitHubTokenExchangeSchema = type({
  code: "string",
  redirectUri: "string",
  state: "string",
});

const GitHubPRFiltersSchema = type({
  repositories: "string[]?",
  labels: "string[]?",
  titleKeywords: "string[]?",
  excludeAuthors: "string[]?",
  minAge: "number?",
  maxAge: "number?",
});

export const GitHubFetchPRsSchema = type({
  repositories: "string[]?",
  "filters?": GitHubPRFiltersSchema,
});

// GitLab specific schemas
export const GitLabAuthUrlSchema = type({
  redirectUri: "string",
  scopes: "string[]?",
});

export const GitLabTokenExchangeSchema = type({
  code: "string",
  redirectUri: "string",
  state: "string",
});

const GitLabMRFiltersSchema = type({
  repositories: "string[]?",
  labels: "string[]?",
  titleKeywords: "string[]?",
  excludeAuthors: "string[]?",
  minAge: "number?",
  maxAge: "number?",
});

export const GitLabFetchMRsSchema = type({
  repositories: "string[]?",
  "filters?": GitLabMRFiltersSchema,
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

// Git provider schemas
const GitProviderTypeSchema = type("'github'|'bitbucket'|'gitlab'");

const GitProviderSchema = type({
  id: "string",
  provider: GitProviderTypeSchema,
  name: "string",
  connected: "boolean",
  connectedAt: "string?", // ISO date string
  repositories: "string[]?",
});

const GitProvidersListSchema = type({
  providers: GitProviderSchema.array(),
});

const GitProviderResponseSchema = type({
  success: "boolean",
  message: "string?",
  data: GitProvidersListSchema,
});

// Slack specific schemas
export const SlackAuthUrlSchema = type({
  redirectUri: "string",
  scopes: "string[]?",
});

export const SlackTokenExchangeSchema = type({
  code: "string",
  redirectUri: "string",
  state: "string",
});

export const SlackSendMessageSchema = type({
  channel: "string",
  message: "string",
});

// Discord specific schemas
export const DiscordAuthUrlSchema = type({
  redirectUri: "string",
  scopes: "string[]?",
  permissions: "string?",
});

export const DiscordTokenExchangeSchema = type({
  code: "string",
  redirectUri: "string",
  state: "string",
});

export const GitProviderQuerySchema = type({
  type: "'github'|'bitbucket'|'gitlab'",
});

export const MessagingProviderQuerySchema = type({
  type: "'slack'|'teams'|'discord'",
});

// Manual connection schemas
export const ManualTokenSchema = type({
  accessToken: "string",
});

// Extract TypeScript types from arktype schemas
export type GitProviderData = typeof GitProviderSchema.infer;
export type GitProviderResponseData = typeof GitProviderResponseSchema.infer;
