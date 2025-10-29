// Simple GitHub API functions
import * as Sentry from "@sentry/cloudflare";
import jwt from "jsonwebtoken";

import type {
  GitHubRepository,
  GitHubPullRequest,
  GitHubReview,
  GitHubRequestedReviewers,
  GitHubOAuthTokenResponse,
  GitHubPR,
  PRFilters,
} from "../types/github";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

const GITHUB_APP_ID = process.env.GITHUB_APP_ID!;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY!;

// Generate GitHub OAuth URL
export function getGitHubAuthUrl(
  state: string,
  redirectUri: string,
  scopes: string[] = ["repo", "read:user", "read:org"]
): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    state,
    response_type: "code",
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

// Exchange code for token
export async function exchangeGitHubToken(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: ${response.status}`);
  }

  const data = (await response.json()) as GitHubOAuthTokenResponse;

  if (data.error) {
    throw new Error(
      `GitHub OAuth error: ${data.error_description || data.error}`
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    scope: data.scope,
    tokenType: data.token_type || "Bearer",
  };
}

// Make authenticated GitHub API request
async function githubApiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "User-Agent": "git-messaging-scheduler/1.0",
      Accept: "application/json",
    },
  });

  if (response.status === 401) {
    throw new Error("GitHub token expired or invalid");
  }

  if (response.status === 429) {
    throw new Error("GitHub API rate limit exceeded");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Get user repositories
// Get repositories for OAuth connections
async function getGitHubOAuthRepositories(token: string): Promise<string[]> {
  const userRepos = await githubApiRequest<GitHubRepository[]>(
    "/user/repos?type=all&sort=updated&per_page=100",
    token
  );

  return userRepos
    .filter((repo) => !repo.archived && !repo.disabled)
    .map((repo) => repo.full_name);
}

// Get repositories for GitHub App connections
async function getGitHubAppRepositories(token: string): Promise<string[]> {
  const installationRepos = await githubApiRequest<{
    repositories: GitHubRepository[];
  }>("/installation/repositories", token);

  return installationRepos.repositories
    .filter((repo) => !repo.archived && !repo.disabled)
    .map((repo) => repo.full_name);
}

// Main function that delegates to the appropriate method based on connection type
export async function getGitHubRepositories(
  token: string,
  connectionType: "user_oauth" | "github_app"
): Promise<string[]> {
  return connectionType === "github_app"
    ? await getGitHubAppRepositories(token)
    : await getGitHubOAuthRepositories(token);
}

// Get pull requests for repositories
export async function getGitHubPullRequests(
  token: string,
  repositories?: string[],
  filters?: PRFilters,
  connectionType: "user_oauth" | "github_app" = "user_oauth"
): Promise<GitHubPR[]> {
  const allPRs: GitHubPR[] = [];

  // If no repositories specified, get all accessible repositories
  const reposToCheck =
    repositories || (await getGitHubRepositories(token, connectionType));

  // Fetch PRs from each repository
  for (const repo of reposToCheck) {
    const prs = await githubApiRequest<GitHubPullRequest[]>(
      `/repos/${repo}/pulls?state=open&per_page=100`,
      token
    );

    const mappedPRs: GitHubPR[] = await Promise.all(
      prs.map(async (pr) => {
        // Get detailed review information and PR stats
        const [reviews, prDetails] = await Promise.all([
          getDetailedReviewInfo(token, repo, pr.number),
          githubApiRequest<GitHubPullRequest>(
            `/repos/${repo}/pulls/${pr.number}`,
            token
          ).catch(() => null),
        ]);

        return {
          id: pr.id.toString(),
          title: pr.title,
          author: pr.user.login,
          url: pr.html_url,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          repository: repo,
          labels: pr.labels.map((label) => label.name),
          status: determineStatus(pr),
          reviewers: [
            ...(pr.requested_reviewers?.map((reviewer) => reviewer.login) ||
              []),
            ...reviews.reviewers,
          ],
          assignees: pr.assignees?.map((assignee) => assignee.login) || [],
          reviewStates: reviews.reviewStates,
          hasApprovals: reviews.hasApprovals,
          hasChangesRequested: reviews.hasChangesRequested,
          additions: prDetails?.additions,
          deletions: prDetails?.deletions,
        };
      })
    );

    allPRs.push(...mappedPRs);
  }

  return applyPRFilters(allPRs, filters);
}

// Get detailed review information
async function getDetailedReviewInfo(
  token: string,
  repo: string,
  prNumber: number
) {
  try {
    const [reviews, checks] = await Promise.all([
      githubApiRequest<GitHubReview[]>(
        `/repos/${repo}/pulls/${prNumber}/reviews`,
        token
      ),
      githubApiRequest<GitHubRequestedReviewers>(
        `/repos/${repo}/pulls/${prNumber}/requested_reviewers`,
        token
      ).catch(() => ({
        users: [],
        teams: [],
      })),
    ]);

    const reviewers = new Set<string>();
    const reviewStates: Record<string, string> = {};

    // Process reviews to get latest state from each reviewer
    for (const review of reviews) {
      if (review.user && review.state !== "COMMENTED") {
        reviewers.add(review.user.login);
        reviewStates[review.user.login] = review.state;
      }
    }

    // Add requested reviewers
    for (const user of checks.users || []) {
      reviewers.add(user.login);
    }
    for (const team of checks.teams || []) {
      reviewers.add(`team:${team.name}`);
    }

    return {
      reviewers: Array.from(reviewers),
      reviewStates,
      hasApprovals: Object.values(reviewStates).includes("APPROVED"),
      hasChangesRequested:
        Object.values(reviewStates).includes("CHANGES_REQUESTED"),
    };
  } catch (error) {
    console.warn(`Failed to fetch review info for ${repo}#${prNumber}:`, error);
    return {
      reviewers: [],
      reviewStates: {},
      hasApprovals: false,
      hasChangesRequested: false,
    };
  }
}

// Determine PR status based on reviews and checks
function determineStatus(pr: GitHubPullRequest): "open" | "closed" | "merged" {
  if (pr.state === "closed") {
    return pr.merged ? "merged" : "closed";
  }
  return "open";
}

// Revoke GitHub app authorization (more complete than just token revocation)
export async function revokeGitHubToken(
  token: string,
  connectionType: "user_oauth" | "github_app" = "user_oauth",
  installationId?: string
): Promise<void> {
  // GitHub App - uninstall the app from the user's account/organization
  if (connectionType === "github_app") {
    if (!installationId) {
      throw new Error("Installation ID is required to revoke GitHub App");
    }

    await revokeGitHubAppInstallation(installationId);
    console.log(
      `Successfully uninstalled GitHub App installation ${installationId}`
    );
    return;
  }

  // OAuth token revocation
  await revokeGitHubOAuthToken(token);
  console.log("Successfully revoked GitHub OAuth token");
}

// Apply PR filters
function applyPRFilters(
  pullRequests: GitHubPR[],
  filters?: PRFilters
): GitHubPR[] {
  if (!filters) return pullRequests;

  return pullRequests.filter((pr) => {
    // Filter by repositories
    if (filters.repositories && filters.repositories.length > 0) {
      if (!filters.repositories.includes(pr.repository)) {
        return false;
      }
    }

    // Filter by labels
    if (filters.labels && filters.labels.length > 0) {
      const hasMatchingLabel = filters.labels.some((label) =>
        pr.labels.some((prLabel) =>
          prLabel.toLowerCase().includes(label.toLowerCase())
        )
      );
      if (!hasMatchingLabel) return false;
    }

    // Filter by title keywords
    if (filters.titleKeywords && filters.titleKeywords.length > 0) {
      const hasMatchingKeyword = filters.titleKeywords.some((keyword) =>
        pr.title.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasMatchingKeyword) return false;
    }

    // Filter by excluded authors
    if (filters.excludeAuthors && filters.excludeAuthors.length > 0) {
      if (filters.excludeAuthors.includes(pr.author)) {
        return false;
      }
    }

    // Filter by age
    if (filters.minAge !== undefined || filters.maxAge !== undefined) {
      const prAgeInDays =
        (Date.now() - new Date(pr.createdAt).getTime()) / (1000 * 60 * 60 * 24);

      if (filters.minAge !== undefined && prAgeInDays < filters.minAge) {
        return false;
      }

      if (filters.maxAge !== undefined && prAgeInDays > filters.maxAge) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generate a JWT for GitHub App authentication
 * JWTs are short-lived (max 10 minutes) and used to get installation tokens
 */
async function generateGitHubAppJWT(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Create JWT payload
  const payload = {
    iat: now, // Issued at time
    exp: now + 600, // Expires in 10 minutes (GitHub's max)
    iss: GITHUB_APP_ID, // Issuer (GitHub App ID)
  };

  // Sign JWT with RSA private key (jsonwebtoken handles RSA format natively)
  const token = jwt.sign(payload, GITHUB_APP_PRIVATE_KEY, {
    algorithm: "RS256",
  });

  return token;
}

/**
 * Get an installation access token for a specific GitHub App installation
 * These tokens are short-lived (1 hour) and scoped to the installation
 */
export async function getGitHubAppInstallationToken(
  installationId: string
): Promise<{
  token: string;
  expiresAt: string;
}> {
  const jwt = await generateGitHubAppJWT();

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "git-messaging-scheduler/1.0",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get installation token: ${response.status} ${errorText}`
    );
  }

  const data: {
    token: string;
    expires_at: string;
  } = await response.json();
  return {
    token: data.token,
    expiresAt: data.expires_at,
  };
}
/**
 * Get installation details for ownership verification
 * Returns installation info including the account that owns it
 */
export async function getGitHubAppInstallationDetails(
  installationId: string
): Promise<{
  id: number;
  account: {
    login: string;
    id: number;
    type: "User" | "Organization";
  };
}> {
  const jwt = await generateGitHubAppJWT();

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "git-messaging-scheduler/1.0",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get installation details: ${response.status} ${errorText}`
    );
  }

  return await response.json();
}

/**
 * Get repositories for a GitHub App installation (generates token on-demand)
 */
export async function getGitHubAppRepositoriesByInstallation(
  installationId: string
): Promise<string[]> {
  const { token } = await getGitHubAppInstallationToken(installationId);
  return await getGitHubAppRepositories(token);
}

/**
 * Get pull requests for a GitHub App installation (generates token on-demand)
 */
export async function getGitHubAppPullRequestsByInstallation(
  installationId: string,
  repositories?: string[],
  filters?: PRFilters
): Promise<GitHubPR[]> {
  const { token } = await getGitHubAppInstallationToken(installationId);
  return await getGitHubPullRequests(
    token,
    repositories,
    filters,
    "github_app"
  );
}

/**
 * Revoke a GitHub OAuth token and app authorization
 * This removes the app from the user's authorized applications
 */
async function revokeGitHubOAuthToken(token: string): Promise<void> {
  // Try to revoke the entire app authorization first
  // This removes the app from the user's authorized applications
  const response = await fetch(
    `https://api.github.com/applications/${GITHUB_CLIENT_ID}/grant`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`
        ).toString("base64")}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: token,
      }),
    }
  );

  if (response.ok || response.status === 404) {
    // Success or already revoked
    return;
  }

  // If that fails, fall back to token-only revocation
  const errorText = await response.text();
  Sentry.captureException(
    "GitHub app authorization revocation failed: " + errorText
  );

  // Fallback: Just revoke the specific token (less complete but still useful)
  const fallbackResponse = await fetch(
    `https://api.github.com/applications/${GITHUB_CLIENT_ID}/token`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`
        ).toString("base64")}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: token,
      }),
    }
  );

  if (!fallbackResponse.ok) {
    // If the token is already invalid/revoked, GitHub returns 404
    // We can consider this a success since the goal is achieved
    if (fallbackResponse.status === 404) {
      return;
    }

    const errorText = await fallbackResponse.text();
    const error = new Error(
      `GitHub token revocation failed: ${fallbackResponse.status} ${errorText}`
    );
    throw error;
  }
}

/**
 * Revoke a GitHub App installation (uninstall the app)
 */
async function revokeGitHubAppInstallation(
  installationId: string
): Promise<void> {
  const jwt = await generateGitHubAppJWT();

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "git-messaging-scheduler/1.0",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to revoke GitHub App installation: ${response.status} ${errorText}`
    );
  }
}
