// GitLab API Response Types based on official documentation

export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  avatar_url: string;
  state: string;
  web_url: string;
  email?: string;
}

export interface GitLabProject {
  id: number;
  name: string;
  path: string;
  path_with_namespace: string;
  visibility: "private" | "internal" | "public";
  archived: boolean;
  web_url: string;
  created_at: string;
  updated_at: string;
  default_branch: string;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
    parent_id: number | null;
    avatar_url: string | null;
    web_url: string;
  };
}

export interface GitLabMergeRequestFromAPI {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: "opened" | "closed" | "merged";
  web_url: string;
  created_at: string;
  updated_at: string;
  author: GitLabUser;
  assignees: GitLabUser[];
  reviewers: GitLabUser[];
  labels: string[];
  source_branch: string;
  target_branch: string;
  merge_status: "can_be_merged" | "cannot_be_merged" | "unchecked";
  detailed_merge_status: string;
  has_conflicts: boolean;
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  merge_commit_sha: string | null;
  squash_commit_sha: string | null;
  merged_at: string | null;
  merged_by: GitLabUser | null;
  merge_user: GitLabUser | null;
  closed_at: string | null;
  closed_by: GitLabUser | null;
}

export interface GitLabOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

export interface GitLabMergeRequestApproval {
  user: GitLabUser;
  approved_by: string; // This is actually the timestamp, not ID
}

export interface GitLabApprovalsResponse {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  merge_status: string;
  approvals_required: number;
  approvals_left: number;
  approved_by: GitLabMergeRequestApproval[];
}

export interface GitLabNote {
  id: number;
  body: string;
  author: GitLabUser;
  created_at: string;
  updated_at: string;
  system: boolean;
  noteable_id: number;
  noteable_type: string;
}

export interface GitLabMR {
  id: string;
  title: string;
  author: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  repository: string;
  labels: string[];
  status: "open" | "closed" | "merged";
  reviewers?: string[];
  assignees?: string[];
  reviewStates?: Record<string, string>;
  hasApprovals?: boolean;
  hasChangesRequested?: boolean;
  checksStatus?: "pending" | "success" | "failure" | "error";
  additions?: number;
  deletions?: number;
}

export interface MRFilters {
  repositories?: string[];
  labels?: string[];
  titleKeywords?: string[];
  excludeAuthors?: string[];
  minAge?: number;
  maxAge?: number;
}
