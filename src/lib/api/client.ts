import { hc } from "hono/client";

import api from "@/api/allRoutes";

// Error response type that can come from middleware/global handlers
type ApiErrorResponse = {
  success: false;
  error: string;
  message: string;
  code?: "TIER_LIMIT_EXCEEDED";
};

// Type that extends only the json() method return type
type WithExtendedJson<T> = T extends { json(): Promise<infer U> }
  ? Omit<T, "json"> & { json(): Promise<U | ApiErrorResponse> }
  : T;

// Recursively apply the extension to all endpoints
type ExtendedClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => Promise<infer Response>
    ? (...args: Args) => Promise<WithExtendedJson<Response>>
    : T[K] extends Record<string, unknown>
    ? ExtendedClient<T[K]>
    : T[K];
};

// this is a trick to calculate the type when compiling
type Client = ReturnType<typeof hc<typeof api>>;
const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof api>(...args);

// Create a typed Hono RPC client
const client = hcWithType("/api");

// Export the API client with extended response types
const apiClient = client as ExtendedClient<typeof client>;

// Export specific API sections for easier imports (using extended client)
export const gitApi = apiClient.providers.git;
export const githubApi = apiClient.providers.git.github;
export const gitlabApi = apiClient.providers.git.gitlab;
export const messagingApi = apiClient.providers.messaging;
export const discordApi = apiClient.providers.messaging.discord;
export const slackApi = apiClient.providers.messaging.slack;
export const schedulesApi = apiClient.schedules;
export const subscriptionsApi = apiClient.subscriptions;
export const tawkApi = apiClient.tawk;
