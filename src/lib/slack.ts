// Slack API functions for messaging provider integration

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!;

export interface SlackChannel {
  id: string;
  name: string;
  type: "public" | "private" | "direct";
  memberCount?: number;
  isArchived?: boolean;
  isMember?: boolean;
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  elements?: Array<{
    type: string;
    text: string;
  }>;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
  attachments?: unknown[];
}

export interface SlackTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope: string;
  tokenType: string;
  teamId: string;
  teamName: string;
  userId: string;
}

// Generate Slack OAuth URL
export function getSlackAuthUrl(
  state: string,
  redirectUri: string,
  scopes: string[] = ["channels:read", "chat:write", "chat:write.public"]
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

  const data = await response.json();

  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error || "Unknown error"}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : undefined,
    scope: data.scope,
    tokenType: data.token_type || "Bearer",
    teamId: data.team.id,
    teamName: data.team.name,
    userId: data.authed_user.id,
  };
}

// Make authenticated Slack API request
export async function slackApiRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
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

  const data = await response.json();

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

interface SlackChannelResponse {
  id: string;
  name: string;
  is_archived: boolean;
  is_member: boolean;
  num_members: number;
}

// Get user's channels
export async function getSlackChannels(token: string): Promise<SlackChannel[]> {
  const [publicChannels, privateChannels] = await Promise.all([
    slackApiRequest(
      "/conversations.list?types=public_channel&limit=1000",
      token
    ),
    slackApiRequest(
      "/conversations.list?types=private_channel&limit=1000",
      token
    ),
  ]);

  const channels: SlackChannel[] = [];

  // Process public channels
  if (publicChannels.channels) {
    channels.push(
      ...publicChannels.channels
        .filter((channel: SlackChannelResponse) => !channel.is_archived)
        .map((channel: SlackChannelResponse) => ({
          id: channel.id,
          name: channel.name,
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
        .filter(
          (channel: SlackChannelResponse) =>
            !channel.is_archived && channel.is_member
        )
        .map((channel: SlackChannelResponse) => ({
          id: channel.id,
          name: channel.name,
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
  message: string
): Promise<void> {
  const payload = { channel, text: message };

  await slackApiRequest("/chat.postMessage", token, {
    method: "POST",
    body: JSON.stringify(payload),
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

// Format pull request notifications for Slack
export function formatSlackPRMessage(
  pullRequests: PullRequest[],
  repositoryName?: string,
  isEscalation = false
): SlackMessage {
  if (pullRequests.length === 0) {
    return {
      channel: "",
      text: `✅ No open pull requests found${
        repositoryName ? ` in ${repositoryName}` : ""
      }`,
    };
  }

  const title = isEscalation
    ? `🚨 *Escalated Pull Requests* (${pullRequests.length})`
    : `📋 *Open Pull Requests* (${pullRequests.length})`;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: title,
      },
    },
  ];

  if (repositoryName) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Repository: *${repositoryName}*`,
        },
      ],
    });
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
    if (Object.keys(prsByRepo).length > 1) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${repo}*`,
        },
      });
    }

    prs.forEach((pr) => {
      const ageInDays = Math.floor(
        (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      let statusEmoji = "🔄";
      let statusText = "";

      if (pr.hasApprovals && !pr.hasChangesRequested) {
        statusEmoji = "✅";
        statusText = " (Approved)";
      } else if (pr.hasChangesRequested) {
        statusEmoji = "❌";
        statusText = " (Changes Requested)";
      } else if (pr.reviewers && pr.reviewers.length > 0) {
        statusEmoji = "👀";
        statusText = " (Under Review)";
      }

      const escalationIndicator = isEscalation ? "🚨 " : "";
      const ageIndicator = ageInDays > 7 ? "⏰ " : ageInDays > 3 ? "⚠️ " : "";

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `${escalationIndicator}${ageIndicator}${statusEmoji} <${pr.url}|${pr.title}>\n` +
            `*Author:* ${pr.author} • *Age:* ${ageInDays} day${
              ageInDays !== 1 ? "s" : ""
            }${statusText}`,
        },
      });

      // Add labels if present
      const labels = pr.labels || [];
      if (labels.length > 0) {
        blocks.push({
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: labels.map((label) => `\`${label}\``).join(" "),
            },
          ],
        });
      }
    });
  });

  if (isEscalation) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "⚠️ These pull requests have been open longer than the configured escalation threshold.",
        },
      ],
    });
  }

  return {
    channel: "",
    text: `${title}${repositoryName ? ` in ${repositoryName}` : ""}`,
    blocks,
  };
}

// Validate Slack token
export async function validateSlackToken(token: string): Promise<boolean> {
  try {
    await slackApiRequest("/auth.test", token);
    return true;
  } catch {
    return false;
  }
}

// Get Slack user info
export async function getSlackUserInfo(token: string): Promise<{
  id: string;
  name: string;
  email?: string;
  teamId: string;
  teamName: string;
}> {
  const authTest = await slackApiRequest("/auth.test", token);

  return {
    id: authTest.user_id,
    name: authTest.user,
    teamId: authTest.team_id,
    teamName: authTest.team,
  };
}
