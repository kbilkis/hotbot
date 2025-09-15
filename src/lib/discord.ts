// Discord API functions for messaging provider integration

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: number; // 0 = text, 2 = voice, 4 = category, etc.
  guild_id?: string;
  position?: number;
  permission_overwrites?: unknown[];
  nsfw?: boolean;
  parent_id?: string;
}

export interface DiscordMessage {
  content: string;
  embeds?: DiscordEmbed[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

export interface DiscordTokenResponse {
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
  scopes: string[] = ["bot", "applications.commands"],
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

  const data = await response.json();
  if (data.error) {
    throw new Error(
      `Discord OAuth error: ${data.error_description || data.error}`
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
export async function discordApiRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
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
export async function discordBotApiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
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

  return response.json();
}

// Get user's guilds (servers)
export async function getDiscordGuilds(token: string): Promise<DiscordGuild[]> {
  const guilds: DiscordGuild[] = await discordApiRequest(
    "/users/@me/guilds",
    token
  );

  return guilds.filter(
    (guild) =>
      // Only return guilds where user has admin permissions or can manage webhooks
      (BigInt(guild.permissions) & BigInt(0x20)) !== BigInt(0) || // MANAGE_WEBHOOKS
      (BigInt(guild.permissions) & BigInt(0x8)) !== BigInt(0) // ADMINISTRATOR
  );
}

// Note: Removed checkBotInGuild - /guilds/{id}/members/@me is PUT only

// Get channels for a guild using bot token
export async function getDiscordChannels(
  guildId: string
): Promise<DiscordChannel[]> {
  const channels: DiscordChannel[] = await discordBotApiRequest(
    `/guilds/${guildId}/channels`
  );

  // Filter for text channels only
  return channels
    .filter((channel) => channel.type === 0) // Text channels
    .sort((a, b) => (a.position || 0) - (b.position || 0));
}

// Get guilds where the bot is installed
export async function getBotGuilds(): Promise<DiscordGuild[]> {
  const guilds: DiscordGuild[] = await discordBotApiRequest(
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
  await discordBotApiRequest(`/channels/${channelId}/messages`, {
    method: "POST",
    body: JSON.stringify(message),
  });
}

export interface PullRequest {
  repository: string;
  title: string;
  url: string;
  author: string;
  createdAt: string;
  hasApprovals?: boolean;
  hasChangesRequested?: boolean;
  reviewers?: string[];
  labels?: string[];
}

// Format pull request notifications for Discord
export function formatDiscordPRMessage(
  pullRequests: PullRequest[],
  repositoryName?: string,
  isEscalation = false
): DiscordMessage {
  if (pullRequests.length === 0) {
    return {
      content: `🎉 No open pull requests${
        repositoryName ? ` in ${repositoryName}` : ""
      }`,
    };
  }

  const title = isEscalation
    ? `🔥 **Escalated Pull Requests** (${pullRequests.length})`
    : `🚀 **Open Pull Requests** (${pullRequests.length})`;

  const embed: DiscordEmbed = {
    title,
    color: isEscalation ? 0xff4444 : 0x5865f2, // Red for escalation, Discord blue for normal
    timestamp: new Date().toISOString(),
    fields: [],
  };

  if (repositoryName) {
    embed.description = `Repository: **${repositoryName}**`;
  }

  // Group PRs by repository if multiple repos
  const prsByRepo = pullRequests.reduce(
    (acc: Record<string, PullRequest[]>, pr) => {
      const repo = pr.repository;
      if (!acc[repo]) acc[repo] = [];
      acc[repo].push(pr);
      return acc;
    },
    {}
  );

  Object.entries(prsByRepo).forEach(([repo, prs]) => {
    prs.forEach((pr, index) => {
      const ageInDays = Math.floor(
        (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      let statusEmoji = "🔄";
      let statusText = "";

      if (pr.hasApprovals && !pr.hasChangesRequested) {
        statusEmoji = "🎯";
        statusText = " (Ready to merge!)";
      } else if (pr.hasChangesRequested) {
        statusEmoji = "🔧";
        statusText = " (Needs fixes)";
      } else if (pr.reviewers && pr.reviewers.length > 0) {
        statusEmoji = "👀";
        statusText = " (Under review)";
      }

      const escalationIndicator = isEscalation ? "🔥 " : "";
      const ageIndicator = ageInDays > 7 ? "🕸️ " : ageInDays > 3 ? "⚡ " : "";

      const fieldName =
        Object.keys(prsByRepo).length > 1 && index === 0 ? `${repo}` : "\u200b"; // Zero-width space for continuation

      const fieldValue =
        `${escalationIndicator}${ageIndicator}${statusEmoji} [${pr.title}](${pr.url})\n` +
        `**Author:** ${pr.author} • **Age:** ${ageInDays} day${
          ageInDays !== 1 ? "s" : ""
        }${statusText}`;

      embed.fields!.push({
        name: fieldName,
        value: fieldValue,
        inline: false,
      });

      // Add labels if present
      const labels = pr.labels || [];
      if (labels.length > 0) {
        embed.fields!.push({
          name: "\u200b",
          value: labels.map((label) => `\`${label}\``).join(" "),
          inline: false,
        });
      }
    });
  });

  if (isEscalation) {
    embed.footer = {
      text: "🌶️ These pull requests have been marinating longer than expected!",
    };
  }

  return {
    content: title,
    embeds: [embed],
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
      const tokenInfo = await response.json();
      console.log("Discord Token Info:", {
        scopes: tokenInfo.scopes,
        application: tokenInfo.application?.name,
        user: tokenInfo.user?.username,
      });
      return true;
    }

    // Fallback to basic user endpoint
    await discordApiRequest("/users/@me", token);
    return true;
  } catch (error) {
    console.error("Discord token validation failed:", error);
    return false;
  }
}

// Get Discord user info
export async function getDiscordUserInfo(token: string): Promise<{
  id: string;
  username: string;
  discriminator: string;
  email?: string;
}> {
  const user = await discordApiRequest("/users/@me", token);

  return {
    id: user.id,
    username: user.username,
    discriminator: user.discriminator,
    email: user.email,
  };
}
