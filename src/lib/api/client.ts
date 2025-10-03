import { hc } from "hono/client";

import type { AppType } from "../../../server";

// Create a typed Hono RPC client
const client = hc<AppType>("/");

// Export the API client
export const apiClient = client.api;

// Export specific API sections for easier imports
export const providersApi = client.api.providers;
export const gitApi = client.api.providers.git;
export const githubApi = client.api.providers.git.github;
export const gitlabApi = client.api.providers.git.gitlab;
export const messagingApi = client.api.providers.messaging;
export const discordApi = client.api.providers.messaging.discord;
export const slackApi = client.api.providers.messaging.slack;
export const schedulesApi = client.api.schedules;
export const subscriptionsApi = client.api.subscriptions;
