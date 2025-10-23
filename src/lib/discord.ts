// Discord API functions for messaging provider integration
import * as Sentry from "@sentry/cloudflare";

import {
  type DiscordOAuth2TokenResponse,
  type DiscordOAuth2TokenInfo,
  type DiscordUser,
  type DiscordGuild,
  type DiscordChannel,
  DiscordChannelType,
  type DiscordMessage,
} from "../types/discord";
import type { PullRequest } from "../types/pull-request";

import {
  categorizePRs,
  formatAge,
  truncateTitle,
  formatLineCount,
  formatLabels,
  buildSummaryLine,
  getDefaultTitle,
  buildEmptyStateMessage,
} from "./messaging/utils";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

// Re-export commonly used types for convenience
export type { DiscordChannel } from "../types/discord";

interface DiscordTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope: string;
  tokenType: string;
  guildId?: string;
  guildName?: string;
}

// Generate Discord OAuth URL for bot installation
export function getDiscordAuthUrl(
  state: string,
  redirectUri: string,
  scopes: string[] = ["bot", "applications.commands", "identify"],
  permissions: string = "68608" // VIEW_CHANNEL (1024) + SEND_MESSAGES (2048) + READ_MESSAGE_HISTORY (65536)
): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    permissions,
    state,
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

// Exchange code for token and get guild info
export async function exchangeDiscordToken(
  code: string,
  redirectUri: string
): Promise<DiscordTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
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
    const errorText = await response.text();
    console.error("Discord token exchange error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(
      `Discord token exchange failed: ${response.status} - ${errorText}`
    );
  }

  const data: DiscordOAuth2TokenResponse = await response.json();
  if ("error" in data) {
    const errorData = data as { error: string; error_description?: string };
    throw new Error(
      `Discord OAuth error: ${errorData.error_description || errorData.error}`
    );
  }

  // For bot installations, Discord includes guild info in the response
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined,
    scope: data.scope,
    tokenType: data.token_type || "Bearer",
    guildId: data.guild?.id,
    guildName: data.guild?.name,
  };
}

// Make authenticated Discord API request
async function discordApiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  console.log("Discord API Request:", {
    endpoint,
    tokenLength: token?.length || 0,
    tokenPrefix: token?.substring(0, 10) + "...",
  });

  const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "git-messaging-scheduler/1.0",
    },
  });

  console.log("Discord API Response:", {
    status: response.status,
    statusText: response.statusText,
    endpoint,
  });

  if (response.status === 401) {
    const errorText = await response.text();
    console.error("Discord 401 Error Details:", errorText);
    throw new Error(`Discord token expired or invalid: ${errorText}`);
  }

  if (response.status === 429) {
    throw new Error("Discord API rate limit exceeded");
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Discord API Error Details:", errorText);
    throw new Error(`Discord API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Make Discord API request using bot token
async function discordBotApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    throw new Error("Discord bot token not configured");
  }

  console.log("Discord Bot API Request:", {
    endpoint,
    hasBotToken: !!botToken,
  });

  const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
      "User-Agent": "git-messaging-scheduler/1.0",
    },
  });

  console.log("Discord Bot API Response:", {
    status: response.status,
    statusText: response.statusText,
    endpoint,
  });

  if (response.status === 401) {
    const errorText = await response.text();
    console.error("Discord Bot 401 Error Details:", errorText);
    throw new Error(`Discord bot token invalid: ${errorText}`);
  }

  if (response.status === 403) {
    const errorText = await response.text();
    console.error("Discord Bot 403 Error Details:", errorText);
    throw new Error(`Discord bot lacks permissions: ${errorText}`);
  }

  if (response.status === 429) {
    throw new Error("Discord API rate limit exceeded");
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Discord Bot API Error Details:", errorText);
    throw new Error(`Discord Bot API error: ${response.status} ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// Get channels for a guild using bot token
export async function getDiscordChannels(
  guildId: string
): Promise<DiscordChannel[]> {
  const channels = await discordBotApiRequest<DiscordChannel[]>(
    `/guilds/${guildId}/channels`
  );

  // Filter for text channels only
  return channels
    .filter((channel) => channel.type === DiscordChannelType.GUILD_TEXT)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
}

// Get guilds where the bot is installed
export async function getBotGuilds(): Promise<DiscordGuild[]> {
  const guilds = await discordBotApiRequest<DiscordGuild[]>(
    "/users/@me/guilds"
  );
  return guilds;
}

// Send message to Discord channel via webhook
export async function sendDiscordMessage(
  webhookUrl: string,
  message: DiscordMessage
): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord webhook error: ${response.status} ${errorText}`);
  }
}

// Send message to Discord channel using bot token
export async function sendDiscordChannelMessage(
  channelId: string,
  message: DiscordMessage
): Promise<void> {
  await discordBotApiRequest<void>(`/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify(message),
  });
}

// Format pull request notifications for Discord - simple approach like Slack
export function formatDiscordPRMessage(
  pullRequests: PullRequest[],
  repositoryName?: string,
  scheduleName: string = "DAILY REMINDER FOR OPEN PULL REQUESTS"
): DiscordMessage {
  const title = getDefaultTitle(scheduleName);

  if (pullRequests.length === 0) {
    return {
      content: buildEmptyStateMessage(title, repositoryName),
    };
  }

  let content = `📋 **${title.toUpperCase()}**\n\n`;

  // Categorize PRs and build summary
  const categories = categorizePRs(pullRequests);
  const totalPRs = pullRequests.length;
  const summaryParts = buildSummaryLine(categories);

  content += `**${totalPRs} PRs:** ${summaryParts}\n\n`;

  // Show each category with PRs - compact format with limits
  const maxPRsPerCategory = 15;
  let totalPRsShown = 0;
  let truncated = false;

  for (const category of categories) {
    if (category.prs.length === 0) continue;

    // Check content length to prevent Discord's 2000 char limit
    if (content.length > 1500) {
      truncated = true;
      break;
    }

    // Category header
    content += `**${category.emoji} ${category.name.toUpperCase()} (${
      category.prs.length
    })**\n`;

    // Limit PRs per category
    const prsToShow = category.prs.slice(0, maxPRsPerCategory);
    const hasMoreInCategory = category.prs.length > maxPRsPerCategory;

    // List PRs in this category
    for (const pr of prsToShow) {
      const ageText = formatAge(pr.createdAt);
      const labels = formatLabels(pr.labels);
      const truncatedTitle = truncateTitle(pr.title);
      const lineCount = formatLineCount(pr.additions, pr.deletions);

      content += `• [${truncatedTitle}](${pr.url})${labels}${lineCount} *${pr.author} • ${ageText}*\n`;
    }

    totalPRsShown += prsToShow.length;

    // Add "more" indicator if needed
    if (hasMoreInCategory) {
      content += `*... and ${category.prs.length - maxPRsPerCategory} more in ${
        category.name
      }*\n`;
    }

    content += "\n";
  }

  // Add truncation notice if we hit limits
  if (truncated) {
    const remainingPRs = pullRequests.length - totalPRsShown;
    content += `⚠️ *Message truncated. ${remainingPRs} more PRs not shown. Check your dashboard for the complete list.*\n\n`;
  }

  // Footer guidance
  content += "💡 *Focus on Ready to Merge and Needs Changes first*";

  return {
    content,
  };
}

// Validate Discord token and get token info
export async function validateDiscordToken(token: string): Promise<boolean> {
  try {
    const response = await fetch("https://discord.com/api/v10/oauth2/@me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const tokenInfo: DiscordOAuth2TokenInfo = await response.json();
      console.log("Discord Token Info:", {
        scopes: tokenInfo.scopes,
        application: tokenInfo.application?.name,
        user: tokenInfo.user?.username,
      });
      return true;
    }

    // Fallback to basic user endpoint
    await discordApiRequest<DiscordUser>("/users/@me", token);
    return true;
  } catch (error) {
    console.error("Discord token validation failed:", error);
    return false;
  }
}

// Leave Discord guild using bot token (removes bot from server)
export async function leaveDiscordGuild(guildId: string): Promise<void> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    throw new Error("Discord bot token not configured");
  }

  try {
    // Use bot token to leave the guild - bots can remove themselves from guilds
    // Don't use discordBotApiRequest because it sets JSON headers, but this endpoint expects no body
    const response = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${guildId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bot ${botToken}`,
          "User-Agent": "git-messaging-scheduler/1.0",
        },
      }
    );

    if (!response.ok) {
      // If we're already not in the guild, that's fine
      if (response.status === 404) {
        return;
      }

      const errorText = await response.text();
      throw new Error(`Discord Bot API error: ${response.status} ${errorText}`);
    }
  } catch (error) {
    // If we're already not in the guild or don't have access, that's fine
    if (error instanceof Error && error.message.includes("404")) {
      return;
    }
    throw error;
  }
}

// Revoke Discord token
export async function revokeDiscordToken(
  token: string,
  guildId?: string
): Promise<void> {
  // First, try to leave the guild if we have a guildId
  if (guildId) {
    try {
      await leaveDiscordGuild(guildId);
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  const credentials = Buffer.from(
    `${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://discord.com/api/oauth2/token/revoke", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      token: token,
      token_type_hint: "access_token",
    }),
  });

  if (!response.ok) {
    // If the token is already invalid/revoked, Discord might return an error
    // We can consider this a success since the goal is achieved
    if (response.status === 400) {
      const errorText = await response.text();
      if (
        errorText.includes("invalid_token") ||
        errorText.includes("token_revoked")
      ) {
        return;
      }
    }

    const errorText = await response.text();
    const error = new Error(
      `Discord token revocation failed: ${response.status} ${errorText}`
    );
    throw error;
  }
}

// Get Discord user info
export async function getDiscordUserInfo(token: string): Promise<{
  id: string;
  username: string;
  discriminator: string;
  email?: string;
}> {
  const user = await discordApiRequest<DiscordUser>("/users/@me", token);

  return {
    id: user.id,
    username: user.username,
    discriminator: user.discriminator,
    email: user.email ?? undefined,
  };
}
