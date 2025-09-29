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

interface DiscordMessage {
  content: string;
  embeds?: DiscordEmbed[];
}

interface DiscordEmbed {
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
async function discordApiRequest(
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
async function discordBotApiRequest(
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

interface PullRequest {
  repository: string;
  title: string;
  url: string;
  author: string;
  createdAt: string;
  hasApprovals?: boolean;
  hasChangesRequested?: boolean;
  reviewers?: string[];
  labels?: string[];
  additions?: number;
  deletions?: number;
}

// Simple PR categorization
interface PRCategory {
  name: string;
  emoji: string;
  prs: PullRequest[];
}

// Format pull request notifications for Discord - simple approach like Slack
export function formatDiscordPRMessage(
  pullRequests: PullRequest[],
  repositoryName?: string,
  scheduleName?: string
): DiscordMessage {
  if (pullRequests.length === 0) {
    return {
      content: `✅ All clear! No open pull requests${
        repositoryName ? ` in ${repositoryName}` : ""
      }`,
    };
  }

  // Build message content similar to Slack format
  const title = scheduleName || "DAILY REMINDER FOR OPEN PULL REQUESTS";
  let content = `📋 **${title.toUpperCase()}**\n\n`;

  // Categorize PRs
  const categories = categorizePRs(pullRequests);

  // Summary line
  const totalPRs = pullRequests.length;
  const shortNames: Record<string, string> = {
    "Ready to Merge": "ready",
    "Needs Changes": "changes",
    "Under Review": "review",
    Stale: "stale",
    "Awaiting Review": "waiting",
  };

  const summaryParts = categories
    .filter((cat) => cat.prs.length > 0)
    .map(
      (cat) =>
        `${cat.emoji}${cat.prs.length} ${
          shortNames[cat.name] || cat.name.toLowerCase()
        }`
    )
    .join(" ");

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
      const ageInDays = Math.floor(
        (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      const ageText =
        ageInDays === 0 ? "today" : ageInDays === 1 ? "1d" : `${ageInDays}d`;

      // Add labels if present
      const labels =
        pr.labels && pr.labels.length > 0
          ? ` [${pr.labels.slice(0, 3).join("] [")}]`
          : "";

      // Truncate long PR titles
      const truncatedTitle =
        pr.title.length > 60 ? pr.title.substring(0, 57) + "..." : pr.title;

      // Add line count if available
      const lineCount =
        pr.additions !== undefined && pr.deletions !== undefined
          ? ` (+${pr.additions}/-${pr.deletions})`
          : "";

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

function categorizePRs(prs: PullRequest[]): PRCategory[] {
  const categories: PRCategory[] = [
    { name: "Ready to Merge", emoji: "✅", prs: [] },
    { name: "Needs Changes", emoji: "🔧", prs: [] },
    { name: "Under Review", emoji: "👀", prs: [] },
    { name: "Stale", emoji: "⏰", prs: [] },
    { name: "Awaiting Review", emoji: "⏳", prs: [] },
  ];

  for (const pr of prs) {
    const ageInDays = Math.floor(
      (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (pr.hasApprovals && !pr.hasChangesRequested) {
      categories[0].prs.push(pr); // Ready to Merge
    } else if (pr.hasChangesRequested) {
      categories[1].prs.push(pr); // Needs Changes
    } else if (ageInDays >= 7) {
      categories[3].prs.push(pr); // Stale
    } else if (pr.reviewers && pr.reviewers.length > 0) {
      categories[2].prs.push(pr); // Under Review
    } else {
      categories[4].prs.push(pr); // Awaiting Review
    }
  }

  return categories;
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
