// Simple GitHub API functions

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

export interface GitHubPR {
  id: string;
  title: string;
  author: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  repository: string;
  labels: string[];
  tags: string[];
  status: "open" | "closed" | "merged";
  reviewers?: string[];
  assignees?: string[];
}

export interface PRFilters {
  repositories?: string[];
  labels?: string[];
  tags?: string[];
  titleKeywords?: string[];
  excludeAuthors?: string[];
  minAge?: number;
  maxAge?: number;
}

// Generate GitHub OAuth URL
export function getGitHubAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "repo read:user",
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

  const data = await response.json();

  if (data.error) {
    throw new Error(
      `GitHub OAuth error: ${data.error_description || data.error}`
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: undefined, // GitHub tokens don't expire
    scope: data.scope,
    tokenType: data.token_type || "Bearer",
  };
}

// Make authenticated GitHub API request
export async function githubApiRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
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
export async function getGitHubRepositories(token: string): Promise<string[]> {
  const repos = await githubApiRequest(
    "/user/repos?type=all&sort=updated&per_page=100",
    token
  );

  return repos
    .filter((repo: any) => !repo.archived && !repo.disabled)
    .map((repo: any) => repo.full_name);
}

// Get pull requests for repositories
export async function getGitHubPullRequests(
  token: string,
  repositories?: string[],
  filters?: PRFilters
): Promise<GitHubPR[]> {
  const allPRs: GitHubPR[] = [];

  // If no repositories specified, get all accessible repositories
  const reposToCheck = repositories || (await getGitHubRepositories(token));

  // Fetch PRs from each repository
  for (const repo of reposToCheck) {
    try {
      const prs = await githubApiRequest(
        `/repos/${repo}/pulls?state=open&per_page=100`,
        token
      );

      const mappedPRs: GitHubPR[] = prs.map((pr: any) => ({
        id: pr.id.toString(),
        title: pr.title,
        author: pr.user.login,
        url: pr.html_url,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        repository: repo,
        labels: pr.labels.map((label: any) => label.name),
        tags: extractTagsFromPR(pr),
        status: "open",
        reviewers:
          pr.requested_reviewers?.map((reviewer: any) => reviewer.login) || [],
        assignees: pr.assignees?.map((assignee: any) => assignee.login) || [],
      }));

      allPRs.push(...mappedPRs);
    } catch (error) {
      console.warn(`Failed to fetch PRs from ${repo}:`, error);
    }
  }

  return applyPRFilters(allPRs, filters);
}

// Extract tags from PR title and branch name
function extractTagsFromPR(pr: any): string[] {
  const tags: string[] = [];

  // Extract tags from title (e.g., [HOTFIX], [URGENT])
  const titleTags = pr.title.match(/\[([^\]]+)\]/g);
  if (titleTags) {
    tags.push(
      ...titleTags.map((tag: string) => tag.slice(1, -1).toUpperCase())
    );
  }

  // Extract tags from branch name
  const branchName = pr.head.ref;
  if (branchName.includes("hotfix")) tags.push("HOTFIX");
  if (branchName.includes("urgent")) tags.push("URGENT");
  if (branchName.includes("feature")) tags.push("FEATURE");
  if (branchName.includes("bugfix") || branchName.includes("fix"))
    tags.push("BUGFIX");

  return [...new Set(tags)]; // Remove duplicates
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

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) =>
        pr.tags.some((prTag) => prTag.toLowerCase().includes(tag.toLowerCase()))
      );
      if (!hasMatchingTag) return false;
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

// Get user info
export async function getGitHubUserInfo(
  token: string
): Promise<{ login: string; name: string; email: string }> {
  const user = await githubApiRequest("/user", token);

  return {
    login: user.login,
    name: user.name || user.login,
    email: user.email || "",
  };
}

// Validate token
export async function validateGitHubToken(token: string): Promise<boolean> {
  try {
    await githubApiRequest("/user", token);
    return true;
  } catch {
    return false;
  }
}
