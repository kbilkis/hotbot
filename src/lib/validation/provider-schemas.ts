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
  id: "string",
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

// Slack specific schemas
export const SlackAuthUrlSchema = type({
  redirectUri: "string",
  scopes: "string[]?",
});

export const SlackTokenExchangeSchema = type({
  code: "string",
  redirectUri: "string",
});

export const SlackSendMessageSchema = type({
  channel: "string",
  message: "string",
});

export const SlackChannelSchema = type({
  id: "string",
  name: "string",
  type: "'public'|'private'|'direct'",
  memberCount: "number?",
  isArchived: "boolean?",
  isMember: "boolean?",
});

export const SlackChannelsListSchema = type({
  channels: SlackChannelSchema.array(),
});

// Discord specific schemas
export const DiscordAuthUrlSchema = type({
  redirectUri: "string",
  scopes: "string[]?",
});

export const DiscordTokenExchangeSchema = type({
  code: "string",
  redirectUri: "string",
});

export const DiscordSendMessageSchema = type({
  webhookUrl: "string",
  message: "string",
});

export const DiscordGuildSchema = type({
  id: "string",
  name: "string",
  icon: "string?",
  owner: "boolean",
  permissions: "string",
});

export const DiscordChannelSchema = type({
  id: "string",
  name: "string",
  type: "number",
  guild_id: "string?",
  position: "number?",
  nsfw: "boolean?",
  parent_id: "string?",
});

export const DiscordGuildsListSchema = type({
  guilds: DiscordGuildSchema.array(),
});

export const DiscordChannelsListSchema = type({
  channels: DiscordChannelSchema.array(),
});

// Provider type validation for route parameters and queries
export const ProviderTypeParamSchema = type({
  type: "string",
});

export const GitProviderQuerySchema = type({
  type: "'github'|'bitbucket'|'gitlab'",
});

export const MessagingProviderQuerySchema = type({
  type: "'slack'|'teams'|'discord'",
});

export const MessagingProviderParamSchema = type({
  type: "'slack'|'teams'|'discord'",
});

// Manual connection schemas
export const ManualTokenSchema = type({
  accessToken: "string",
});

// Messaging provider schemas
export const MessagingProviderTypeSchema = type("'slack'|'teams'|'discord'");

export const MessagingProviderSchema = type({
  id: "number",
  provider: MessagingProviderTypeSchema,
  name: "string",
  connected: "boolean",
  connectedAt: "string?", // ISO date string
  channels: SlackChannelSchema.array().optional(),
});

export const MessagingProvidersListSchema = type({
  providers: MessagingProviderSchema.array(),
});

export const MessagingProviderResponseSchema = type({
  success: "boolean",
  message: "string?",
  data: MessagingProvidersListSchema,
});

// Extract TypeScript types from arktype schemas
export type OAuthStateData = typeof OAuthStateSchema.infer;
export type OAuthCallbackData = typeof OAuthCallbackSchema.infer;
export type ConnectProviderData = typeof ConnectProviderSchema.infer;
export type GitHubAuthUrlData = typeof GitHubAuthUrlSchema.infer;
export type GitHubTokenExchangeData = typeof GitHubTokenExchangeSchema.infer;
export type GitHubPRFiltersData = typeof GitHubPRFiltersSchema.infer;
export type GitHubFetchPRsData = typeof GitHubFetchPRsSchema.infer;
export type SlackAuthUrlData = typeof SlackAuthUrlSchema.infer;
export type SlackTokenExchangeData = typeof SlackTokenExchangeSchema.infer;
export type SlackSendMessageData = typeof SlackSendMessageSchema.infer;
export type SlackChannelData = typeof SlackChannelSchema.infer;
export type SlackChannelsListData = typeof SlackChannelsListSchema.infer;
export type DiscordAuthUrlData = typeof DiscordAuthUrlSchema.infer;
export type DiscordTokenExchangeData = typeof DiscordTokenExchangeSchema.infer;
export type DiscordSendMessageData = typeof DiscordSendMessageSchema.infer;
export type DiscordGuildData = typeof DiscordGuildSchema.infer;
export type DiscordChannelData = typeof DiscordChannelSchema.infer;
export type DiscordGuildsListData = typeof DiscordGuildsListSchema.infer;
export type DiscordChannelsListData = typeof DiscordChannelsListSchema.infer;
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
export type MessagingProviderTypeData =
  typeof MessagingProviderTypeSchema.infer;
export type MessagingProviderData = typeof MessagingProviderSchema.infer;
export type MessagingProvidersListData =
  typeof MessagingProvidersListSchema.infer;
export type MessagingProviderResponseData =
  typeof MessagingProviderResponseSchema.infer;
