// Slack API functions for messaging provider integration
import type { PullRequest, PRCategory } from "../types/pull-request";
import type {
  OauthV2AccessResponse,
  ConversationsListResponse,
  AuthTestResponse,
  ChatPostMessageResponse,
  Channel,
  SlackChannel,
  SlackBlock,
  SlackMessage,
  SlackTokenResponse,
  SlackUserInfo,
} from "../types/slack";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!;

// Generate Slack OAuth URL
export function getSlackAuthUrl(
  state: string,
  redirectUri: string,
  scopes: string[] = [
    "channels:read",
    "chat:write",
    "chat:write.public",
    "groups:read",
  ]
): string {
  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: scopes.join(","),
    state,
    response_type: "code",
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

// Exchange code for token
export async function exchangeSlackToken(
  code: string,
  redirectUri: string
): Promise<SlackTokenResponse> {
  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Slack token exchange failed: ${response.status}`);
  }

  const data = (await response.json()) as OauthV2AccessResponse;

  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error || "Unknown error"}`);
  }

  return {
    accessToken: data.access_token!,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined,
    scope: data.scope!,
    tokenType: data.token_type || "Bearer",
    teamId: data.team!.id!,
    teamName: data.team!.name!,
    userId: data.authed_user!.id!,
  };
}

// Make authenticated Slack API request
async function slackApiRequest<T extends { ok?: boolean; error?: string }>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`https://slack.com/api${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Slack API error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as T;

  if (!data.ok) {
    if (data.error === "invalid_auth" || data.error === "token_revoked") {
      throw new Error("Slack token expired or invalid");
    }
    if (data.error === "rate_limited") {
      throw new Error("Slack API rate limit exceeded");
    }
    throw new Error(`Slack API error: ${data.error}`);
  }

  return data;
}

// Get user's channels
export async function getSlackChannels(token: string): Promise<SlackChannel[]> {
  const [publicChannels, privateChannels] = await Promise.all([
    slackApiRequest<ConversationsListResponse>(
      "/conversations.list?types=public_channel&limit=1000",
      token
    ),
    slackApiRequest<ConversationsListResponse>(
      "/conversations.list?types=private_channel&limit=1000",
      token
    ),
  ]);

  const channels: SlackChannel[] = [];

  // Process public channels
  if (publicChannels.channels) {
    channels.push(
      ...publicChannels.channels
        .filter((channel: Channel) => !channel.is_archived)
        .map((channel: Channel) => ({
          id: channel.id!,
          name: channel.name!,
          type: "public" as const,
          memberCount: channel.num_members,
          isArchived: channel.is_archived,
          isMember: channel.is_member,
        }))
    );
  }

  // Process private channels
  if (privateChannels.channels) {
    channels.push(
      ...privateChannels.channels
        .filter((channel: Channel) => !channel.is_archived && channel.is_member)
        .map((channel: Channel) => ({
          id: channel.id!,
          name: channel.name!,
          type: "private" as const,
          memberCount: channel.num_members,
          isArchived: channel.is_archived,
          isMember: channel.is_member,
        }))
    );
  }

  return channels.sort((a, b) => a.name.localeCompare(b.name));
}

// Send message to Slack channel
export async function sendSlackMessage(
  token: string,
  channel: string,
  payload: SlackMessage
): Promise<void> {
  const body = {
    channel,
    text: payload.text,
    blocks: undefined as SlackBlock[] | undefined,
  };

  // Include blocks if provided
  if (payload.blocks && payload.blocks.length > 0) {
    body.blocks = payload.blocks;
  }

  await slackApiRequest<ChatPostMessageResponse>("/chat.postMessage", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Format pull request notifications for Slack - simple blocks approach
export function formatSlackPRMessage(
  pullRequests: PullRequest[],
  repositoryName?: string,
  scheduleName?: string
): SlackMessage {
  if (pullRequests.length === 0) {
    const title = scheduleName || "DAILY REMINDER FOR OPEN PULL REQUESTS";
    return {
      channel: "",
      text: `📋 *${title.toUpperCase()}*\n\n✅ All clear! No open pull requests${
        repositoryName ? ` in ${repositoryName}` : ""
      }`,
    };
  }

  const blocks: SlackBlock[] = [];

  // Header
  const title = scheduleName || "DAILY REMINDER FOR OPEN PULL REQUESTS";
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `📋 *${title.toUpperCase()}*`,
    },
  });

  // Categorize PRs
  const categories = categorizePRs(pullRequests);

  // Summary line with shortened names
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

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${totalPRs} PRs:* ${summaryParts}`,
    },
  });

  blocks.push({ type: "divider" });

  // Show each category with PRs - compact format with limits
  const maxBlocks = 45; // Leave room for header, summary, footer
  let blockCount = blocks.length;
  let totalPRsShown = 0;
  let truncated = false;

  for (const category of categories) {
    if (category.prs.length === 0) continue;

    // Check if we have room for at least the category header + 1 PR block
    if (blockCount >= maxBlocks - 2) {
      truncated = true;
      break;
    }

    // Category header
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${category.emoji} ${category.name.toUpperCase()} (${
          category.prs.length
        })*`,
      },
    });
    blockCount++;

    // Limit PRs per category to prevent huge blocks
    const maxPRsPerCategory = 15;
    const prsToShow = category.prs.slice(0, maxPRsPerCategory);
    const hasMoreInCategory = category.prs.length > maxPRsPerCategory;

    // Group all PRs in this category into a single block
    const prLines = prsToShow.map((pr) => {
      const ageInDays = Math.floor(
        (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      const ageText =
        ageInDays === 0 ? "today" : ageInDays === 1 ? "1d" : `${ageInDays}d`;

      // Add labels if present
      const labels =
        pr.labels && pr.labels.length > 0
          ? ` [${pr.labels.slice(0, 3).join("] [")}]` // Show up to 3 labels
          : "";

      // Truncate long PR titles
      const truncatedTitle =
        pr.title.length > 60 ? pr.title.substring(0, 57) + "..." : pr.title;

      // Add line count if available
      const lineCount =
        pr.additions !== undefined && pr.deletions !== undefined
          ? ` (+${pr.additions}/-${pr.deletions})`
          : "";

      return `• <${pr.url}|${truncatedTitle}>${labels}${lineCount} _${pr.author} • ${ageText}_`;
    });

    // Add all PRs in a single block to reduce vertical space
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: prLines.join("\n"),
      },
    });
    blockCount++;
    totalPRsShown += prsToShow.length;

    // Add "more" indicator if needed
    if (hasMoreInCategory) {
      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `_... and ${
              category.prs.length - maxPRsPerCategory
            } more in ${category.name}_`,
          },
        ],
      });
      blockCount++;
    }
  }

  // Add truncation notice if we hit limits
  if (truncated) {
    const remainingPRs = pullRequests.length - totalPRsShown;
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `⚠️ _Message truncated. ${remainingPRs} more PRs not shown._`,
        },
      ],
    });
  }

  // Footer guidance
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "💡 _Focus on Ready to Merge and Needs Changes first_",
      },
    ],
  });

  return {
    channel: "",
    text: `${title} (${totalPRs} PRs)${
      repositoryName ? ` in ${repositoryName}` : ""
    }`,
    blocks,
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

// Validate Slack token
export async function validateSlackToken(token: string): Promise<boolean> {
  try {
    await slackApiRequest<AuthTestResponse>("/auth.test", token);
    return true;
  } catch {
    return false;
  }
}

// Get Slack user info
export async function getSlackUserInfo(token: string): Promise<SlackUserInfo> {
  const authTest = await slackApiRequest<AuthTestResponse>("/auth.test", token);

  return {
    id: authTest.user_id!,
    name: authTest.user!,
    teamId: authTest.team_id!,
    teamName: authTest.team!,
  };
}
