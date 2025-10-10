// Scheduled Token Refresh Job
// Run this periodically to refresh tokens that are about to expire

import * as Sentry from "@sentry/google-cloud-serverless";
import { lt, and, isNotNull, eq } from "drizzle-orm";

import { db } from "../database/client";
import {
  GitProvider,
  gitProviders,
  MessagingProvider,
  messagingProviders,
} from "../database/schema";

// Refresh all tokens that expire within the next hour
export async function refreshExpiringTokens(): Promise<{
  gitProvidersRefreshed: number;
  messagingProvidersRefreshed: number;
  errors: string[];
}> {
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  const errors: string[] = [];
  let gitProvidersRefreshed = 0;
  let messagingProvidersRefreshed = 0;

  console.log("Starting scheduled token refresh...");

  // Find git providers with tokens expiring soon
  const expiringGitProviders = await db
    .select()
    .from(gitProviders)
    .where(
      and(
        lt(gitProviders.expiresAt, oneHourFromNow),
        isNotNull(gitProviders.refreshToken)
      )
    );

  console.log(
    `Found ${expiringGitProviders.length} git providers with expiring tokens`
  );

  // Refresh git provider tokens
  for (const provider of expiringGitProviders) {
    try {
      const success = await refreshGitProviderToken(provider);
      if (success) {
        gitProvidersRefreshed++;
        console.log(
          `Refreshed git provider ${provider.id} (${provider.provider})`
        );
      } else {
        errors.push(
          `Failed to refresh git provider ${provider.id} (${provider.provider})`
        );
      }
    } catch (error) {
      const errorMsg = `Error refreshing git provider ${provider.id}: ${error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
      Sentry.captureException(error, {
        tags: {
          provider: provider.provider,
          providerId: provider.id,
          userId: provider.userId,
        },
      });
    }
  }

  // Find messaging providers with tokens expiring soon
  const expiringMessagingProviders = await db
    .select()
    .from(messagingProviders)
    .where(
      and(
        lt(messagingProviders.expiresAt, oneHourFromNow),
        isNotNull(messagingProviders.refreshToken)
      )
    );

  console.log(
    `Found ${expiringMessagingProviders.length} messaging providers with expiring tokens`
  );

  // Refresh messaging provider tokens
  for (const provider of expiringMessagingProviders) {
    try {
      const success = await refreshMessagingProviderToken(provider);
      if (success) {
        messagingProvidersRefreshed++;
        console.log(
          `Refreshed messaging provider ${provider.id} (${provider.provider})`
        );
      } else {
        errors.push(
          `Failed to refresh messaging provider ${provider.id} (${provider.provider})`
        );
      }
    } catch (error) {
      const errorMsg = `Error refreshing messaging provider ${provider.id}: ${error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
      Sentry.captureException(error, {
        tags: {
          provider: provider.provider,
          providerId: provider.id,
          userId: provider.userId,
        },
      });
    }
  }

  console.log(
    `Token refresh completed. Git: ${gitProvidersRefreshed}, Messaging: ${messagingProvidersRefreshed}, Errors: ${errors.length}`
  );

  return {
    gitProvidersRefreshed,
    messagingProvidersRefreshed,
    errors,
  };
}

// GitLab token refresh
async function refreshGitLabToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const GITLAB_CLIENT_ID = process.env.GITLAB_CLIENT_ID!;
  const GITLAB_CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET!;
  const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL || "https://gitlab.com";

  const params = new URLSearchParams({
    client_id: GITLAB_CLIENT_ID,
    client_secret: GITLAB_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(`${GITLAB_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    console.error("GitLab token refresh failed:", responseBody);
    throw new Error(`GitLab token refresh failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    error?: string;
    error_description?: string;
  };

  if (data.error) {
    throw new Error(
      `GitLab refresh error: ${data.error_description || data.error}`
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// Discord token refresh
async function refreshDiscordToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const credentials = Buffer.from(
    `${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    console.error("Discord token refresh failed:", responseBody);
    throw new Error(`Discord token refresh failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    error?: string;
    error_description?: string;
  };

  if (data.error) {
    throw new Error(
      `Discord refresh error: ${data.error_description || data.error}`
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// Note: Slack doesn't support refresh tokens in their standard OAuth flow
// Slack tokens typically don't expire, so refresh is not needed

// Generic refresh function for git providers
async function refreshGitProviderToken(
  providerData: GitProvider
): Promise<boolean> {
  if (!providerData.refreshToken) {
    console.warn(
      `No refresh token available for git provider ${providerData.id}`
    );
    return false;
  }

  let refreshResult;

  switch (providerData.provider) {
    case "gitlab":
      refreshResult = await refreshGitLabToken(providerData.refreshToken);
      break;
    case "github":
      // GitHub tokens don't expire by default, but if you're using GitHub Apps
      // you might need to implement refresh logic here
      return true;
    case "bitbucket":
      // Implement Bitbucket refresh if needed
      throw new Error("Bitbucket refresh not implemented yet");
    default:
      throw new Error(`Unsupported git provider: ${providerData.provider}`);
  }

  // Update the database with new tokens
  await db
    .update(gitProviders)
    .set({
      accessToken: refreshResult.accessToken,
      refreshToken: refreshResult.refreshToken,
      expiresAt: new Date(Date.now() + refreshResult.expiresIn * 1000),
      updatedAt: new Date(),
    })
    .where(eq(gitProviders.id, providerData.id));

  console.log(
    `Successfully refreshed token for git provider ${providerData.id}`
  );
  return true;
}

// Generic refresh function for messaging providers
async function refreshMessagingProviderToken(
  providerData: MessagingProvider
): Promise<boolean> {
  if (!providerData.refreshToken) {
    console.warn(
      `No refresh token available for messaging provider ${providerData.id}`
    );
    return false;
  }

  let refreshResult;

  switch (providerData.provider) {
    case "discord":
      refreshResult = await refreshDiscordToken(providerData.refreshToken);
      break;
    case "slack":
      // Slack doesn't support refresh tokens - tokens typically don't expire
      return true;
    case "teams":
      // Implement Teams refresh if needed
      throw new Error("Teams refresh not implemented yet");
    default:
      throw new Error(
        `Unsupported messaging provider: ${providerData.provider}`
      );
  }

  // Update the database with new tokens
  await db
    .update(messagingProviders)
    .set({
      accessToken: refreshResult.accessToken,
      refreshToken: refreshResult.refreshToken || providerData.refreshToken,
      expiresAt: refreshResult.expiresIn
        ? new Date(Date.now() + refreshResult.expiresIn * 1000)
        : providerData.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(messagingProviders.id, providerData.id));

  console.log(
    `Successfully refreshed token for messaging provider ${providerData.id}`
  );
  return true;
}
