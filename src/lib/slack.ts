// Slack API functions for messaging provider integration
import type { PullRequest } from "../types/pull-request";
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

  const data: T = await response.json();

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

  // Process public channels
  const processedPublicChannels = publicChannels.channels
    ? publicChannels.channels
        .filter((channel: Channel) => !channel.is_archived)
        .map((channel: Channel) => ({
          id: channel.id!,
          name: channel.name!,
          type: "public" as const,
          memberCount: channel.num_members,
          isArchived: channel.is_archived,
          isMember: channel.is_member,
        }))
    : [];

  // Process private channels
  const processedPrivateChannels = privateChannels.channels
    ? privateChannels.channels
        .filter((channel: Channel) => !channel.is_archived && channel.is_member)
        .map((channel: Channel) => ({
          id: channel.id!,
          name: channel.name!,
          type: "private" as const,
          memberCount: channel.num_members,
          isArchived: channel.is_archived,
          isMember: channel.is_member,
        }))
    : [];

  // Combine all channels
  const channels = [...processedPublicChannels, ...processedPrivateChannels];

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
  const title = getDefaultTitle(scheduleName);

  if (pullRequests.length === 0) {
    return {
      channel: "",
      text: buildEmptyStateMessage(title, repositoryName).replaceAll("**", "*"),
    };
  }

  // Categorize PRs and build summary
  const categories = categorizePRs(pullRequests);
  const totalPRs = pullRequests.length;
  const summaryParts = buildSummaryLine(categories);

  // Build initial blocks array
  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📋 *${title.toUpperCase()}*`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${totalPRs} PRs:* ${summaryParts}`,
      },
    },
    { type: "divider" },
  ];

  // Show each category with PRs - compact format with limits
  const maxBlocks = 45; // Leave room for header, summary, footer
  let blockCount = blocks.length;
  let totalPRsShown = 0;
  let truncated = false;
  const categoryBlocks: SlackBlock[] = [];

  for (const category of categories) {
    if (category.prs.length === 0) continue;

    // Check if we have room for at least the category header + 1 PR block
    if (blockCount >= maxBlocks - 2) {
      truncated = true;
      break;
    }

    // Limit PRs per category to prevent huge blocks
    const maxPRsPerCategory = 15;
    const prsToShow = category.prs.slice(0, maxPRsPerCategory);
    const hasMoreInCategory = category.prs.length > maxPRsPerCategory;

    // Group all PRs in this category into a single block
    const prLines = prsToShow.map((pr) => {
      const ageText = formatAge(pr.createdAt);
      const labels = formatLabels(pr.labels);
      const truncatedTitle = truncateTitle(pr.title);
      const lineCount = formatLineCount(pr.additions, pr.deletions);

      return `• <${pr.url}|${truncatedTitle}>${labels}${lineCount} _${pr.author} • ${ageText}_`;
    });

    // Build blocks for this category
    const currentCategoryBlocks: SlackBlock[] = [
      // Category header
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${category.emoji} ${category.name.toUpperCase()} (${
            category.prs.length
          })*`,
        },
      },
      // PRs block
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: prLines.join("\n"),
        },
      },
    ];

    // Add "more" indicator if needed
    if (hasMoreInCategory) {
      currentCategoryBlocks.push({
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
    }

    categoryBlocks.push(...currentCategoryBlocks);
    blockCount += currentCategoryBlocks.length;
    totalPRsShown += prsToShow.length;
  }

  // Build footer blocks
  const footerBlocks: SlackBlock[] = [];

  // Add truncation notice if we hit limits
  if (truncated) {
    const remainingPRs = pullRequests.length - totalPRsShown;
    footerBlocks.push({
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
  footerBlocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "💡 _Focus on Ready to Merge and Needs Changes first_",
      },
    ],
  });

  // Combine all blocks
  const allBlocks = [...blocks, ...categoryBlocks, ...footerBlocks];

  return {
    channel: "",
    text: `${title} (${totalPRs} PRs)${
      repositoryName ? ` in ${repositoryName}` : ""
    }`,
    blocks: allBlocks,
  };
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
