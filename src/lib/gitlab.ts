// GitLab API functions
import type {
  GitLabProject,
  GitLabMergeRequestFromAPI,
  GitLabOAuthTokenResponse,
  GitLabApprovalsResponse,
  GitLabNote,
  GitLabMR,
  MRFilters,
} from "../types/gitlab";

const GITLAB_CLIENT_ID = process.env.GITLAB_CLIENT_ID!;
const GITLAB_CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET!;
const GITLAB_BASE_URL = process.env.GITLAB_BASE_URL || "https://gitlab.com";

// Generate GitLab OAuth URL
export function getGitLabAuthUrl(
  state: string,
  redirectUri: string,
  scopes: string[] = ["read_user", "read_api", "read_repository"]
): string {
  const params = new URLSearchParams({
    client_id: GITLAB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    state,
    response_type: "code",
  });

  return `${GITLAB_BASE_URL}/oauth/authorize?${params.toString()}`;
}

// Exchange code for token
export async function exchangeGitLabToken(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: GITLAB_CLIENT_ID,
    client_secret: GITLAB_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
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
    throw new Error(`GitLab token exchange failed: ${response.status}`);
  }

  const data = (await response.json()) as GitLabOAuthTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (data.error) {
    throw new Error(
      `GitLab OAuth error: ${data.error_description || data.error}`
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    scope: data.scope,
    tokenType: data.token_type || "Bearer",
    expiresIn: data.expires_in,
  };
}

// Make authenticated GitLab API request
async function gitlabApiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${GITLAB_BASE_URL}/api/v4${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "User-Agent": "git-messaging-scheduler/1.0",
      Accept: "application/json",
    },
  });

  if (response.status === 401) {
    throw new Error("GitLab token expired or invalid");
  }

  if (response.status === 429) {
    throw new Error("GitLab API rate limit exceeded");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitLab API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Get user projects (repositories)
export async function getGitLabProjects(token: string): Promise<string[]> {
  const projects = await gitlabApiRequest<GitLabProject[]>(
    "/projects?membership=true&archived=false&per_page=100&order_by=updated_at&sort=desc",
    token
  );

  return projects
    .filter((project) => !project.archived)
    .map((project) => project.path_with_namespace);
}

// Get merge requests for projects
export async function getGitLabMergeRequests(
  token: string,
  repositories?: string[],
  filters?: MRFilters
): Promise<GitLabMR[]> {
  const allMRs: GitLabMR[] = [];

  // If no repositories specified, get all accessible projects
  const projectsToCheck = repositories || (await getGitLabProjects(token));

  // Fetch MRs from each project
  for (const projectPath of projectsToCheck) {
    // Get project ID from path
    const encodedPath = encodeURIComponent(projectPath);
    const project = await gitlabApiRequest<GitLabProject>(
      `/projects/${encodedPath}`,
      token
    );

    const mrs = await gitlabApiRequest<GitLabMergeRequestFromAPI[]>(
      `/projects/${project.id}/merge_requests?state=opened&per_page=100&order_by=updated_at&sort=desc`,
      token
    );

    const mappedMRs: GitLabMR[] = await Promise.all(
      mrs.map(async (mr) => {
        // Get detailed approval information
        const approvals = await getDetailedApprovalInfo(
          token,
          project.id,
          mr.iid
        );

        return {
          id: mr.id.toString(),
          title: mr.title,
          author: mr.author.username,
          url: mr.web_url,
          createdAt: mr.created_at,
          updatedAt: mr.updated_at,
          repository: projectPath,
          labels: mr.labels || [],
          status: determineStatus(mr),
          reviewers: mr.reviewers?.map((reviewer) => reviewer.username) || [],
          assignees: mr.assignees?.map((assignee) => assignee.username) || [],
          reviewStates: approvals.reviewStates,
          hasApprovals: approvals.hasApprovals,
          hasChangesRequested: approvals.hasChangesRequested,
          checksStatus: determinePipelineStatus(mr),
        };
      })
    );

    allMRs.push(...mappedMRs);
  }

  return applyMRFilters(allMRs, filters);
}

// Get detailed approval information
async function getDetailedApprovalInfo(
  token: string,
  projectId: number,
  mrIid: number
) {
  try {
    const [approvals, notes] = await Promise.all([
      gitlabApiRequest<GitLabApprovalsResponse>(
        `/projects/${projectId}/merge_requests/${mrIid}/approvals`,
        token
      ).catch(() => ({ approved_by: [] } as Partial<GitLabApprovalsResponse>)),
      gitlabApiRequest<GitLabNote[]>(
        `/projects/${projectId}/merge_requests/${mrIid}/notes?per_page=100`,
        token
      ).catch(() => []),
    ]);

    const reviewStates: Record<string, string> = {};
    let hasApprovals = false;
    let hasChangesRequested = false;

    // Process approvals
    if (approvals.approved_by && approvals.approved_by.length > 0) {
      for (const approval of approvals.approved_by) {
        reviewStates[approval.user.username] = "APPROVED";
        hasApprovals = true;
      }
    }

    // Process notes for change requests (look for specific patterns)
    if (Array.isArray(notes)) {
      for (const note of notes) {
        if (note.system === false && note.body) {
          const body = note.body.toLowerCase();
          // Look for common change request patterns
          if (
            body.includes("needs changes") ||
            body.includes("request changes") ||
            body.includes("please fix") ||
            body.includes("changes needed")
          ) {
            reviewStates[note.author.username] = "CHANGES_REQUESTED";
            hasChangesRequested = true;
          }
        }
      }
    }

    return {
      reviewStates,
      hasApprovals,
      hasChangesRequested,
    };
  } catch (error) {
    console.warn(
      `Failed to fetch approval info for project ${projectId} MR ${mrIid}:`,
      error
    );
    return {
      reviewStates: {},
      hasApprovals: false,
      hasChangesRequested: false,
    };
  }
}

// Determine MR status based on GitLab state
function determineStatus(
  mr: GitLabMergeRequestFromAPI
): "open" | "closed" | "merged" {
  if (mr.state === "merged") return "merged";
  if (mr.state === "closed") return "closed";
  return "open";
}

// Determine pipeline status (simplified)
function determinePipelineStatus(
  mr: GitLabMergeRequestFromAPI
): "pending" | "success" | "failure" | "error" {
  // GitLab doesn't provide pipeline status in basic MR API
  // This would require additional API calls to get pipeline info
  // For now, we'll use merge_status as a proxy
  if (mr.merge_status === "can_be_merged") return "success";
  if (mr.merge_status === "cannot_be_merged") return "failure";
  return "pending";
}

// Apply MR filters
function applyMRFilters(
  mergeRequests: GitLabMR[],
  filters?: MRFilters
): GitLabMR[] {
  if (!filters) return mergeRequests;

  return mergeRequests.filter((mr) => {
    // Filter by repositories
    if (filters.repositories && filters.repositories.length > 0) {
      if (!filters.repositories.includes(mr.repository)) {
        return false;
      }
    }

    // Filter by labels
    if (filters.labels && filters.labels.length > 0) {
      const hasMatchingLabel = filters.labels.some((label) =>
        mr.labels.some((mrLabel) =>
          mrLabel.toLowerCase().includes(label.toLowerCase())
        )
      );
      if (!hasMatchingLabel) return false;
    }

    // Filter by title keywords
    if (filters.titleKeywords && filters.titleKeywords.length > 0) {
      const hasMatchingKeyword = filters.titleKeywords.some((keyword) =>
        mr.title.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasMatchingKeyword) return false;
    }

    // Filter by excluded authors
    if (filters.excludeAuthors && filters.excludeAuthors.length > 0) {
      if (filters.excludeAuthors.includes(mr.author)) {
        return false;
      }
    }

    // Filter by age
    if (filters.minAge !== undefined || filters.maxAge !== undefined) {
      const mrAgeInDays =
        (Date.now() - new Date(mr.createdAt).getTime()) / (1000 * 60 * 60 * 24);

      if (filters.minAge !== undefined && mrAgeInDays < filters.minAge) {
        return false;
      }

      if (filters.maxAge !== undefined && mrAgeInDays > filters.maxAge) {
        return false;
      }
    }

    return true;
  });
}
