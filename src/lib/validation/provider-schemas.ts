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

// Git provider schemas
const GitProviderTypeSchema = type("'github'|'bitbucket'|'gitlab'");

const _GitProviderSchema = type({
  id: "string",
  provider: GitProviderTypeSchema,
  name: "string",
  connected: "boolean",
  connectedAt: "string?", // ISO date string
  repositories: "string[]?",
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

export const RepositoriesQuerySchema = type({
  providerId: "string",
});

export const MessagingProviderQuerySchema = type({
  type: "'slack'|'teams'|'discord'",
});

// Manual connection schemas
export const ManualTokenSchema = type({
  accessToken: "string",
});

// Test message schemas
export const TestChannelSchema = type({
  channelId: "string",
  message: "string",
});

export const TestWebhookSchema = type({
  webhookUrl: "string",
  message: "string",
});

// Channels query schema
export const ChannelsQuerySchema = type({
  providerId: "string",
  "guildId?": "string", // Optional, for Discord guilds
});

// Extract TypeScript types from arktype schemas
export type GitProviderData = typeof _GitProviderSchema.infer;
