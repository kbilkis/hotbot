// GitHub API response types based on official GitHub REST API documentation
// https://docs.github.com/en/rest/pulls/pulls

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name?: string;
  email?: string;
}

export interface GitHubLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  description?: string;
  color: string;
  default: boolean;
}

export interface GitHubMilestone {
  url: string;
  html_url: string;
  labels_url: string;
  id: number;
  node_id: string;
  number: number;
  state: "open" | "closed";
  title: string;
  description?: string;
  creator: GitHubUser;
  open_issues: number;
  closed_issues: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  due_on?: string;
}

export interface GitHubTeam {
  id: number;
  node_id: string;
  name: string;
  slug: string;
  description?: string;
  privacy?: string;
  permission?: string;
  url: string;
  html_url: string;
  members_url: string;
  repositories_url: string;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  description?: string;
  fork: boolean;
  url: string;
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  ssh_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  clone_url: string;
  mirror_url?: string;
  hooks_url: string;
  svn_url: string;
  homepage?: string;
  language?: string;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  is_template?: boolean;
  topics?: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;
  visibility?: string;
  pushed_at?: string;
  created_at: string;
  updated_at: string;
  permissions?: {
    admin: boolean;
    maintain?: boolean;
    push: boolean;
    triage?: boolean;
    pull: boolean;
  };
  allow_rebase_merge?: boolean;
  template_repository?: GitHubRepository;
  temp_clone_token?: string;
  allow_squash_merge?: boolean;
  allow_auto_merge?: boolean;
  delete_branch_on_merge?: boolean;
  allow_merge_commit?: boolean;
  subscribers_count?: number;
  network_count?: number;
}

export interface GitHubPullRequestHead {
  label: string;
  ref: string;
  sha: string;
  user: GitHubUser;
  repo: GitHubRepository;
}

export interface GitHubPullRequestBase {
  label: string;
  ref: string;
  sha: string;
  user: GitHubUser;
  repo: GitHubRepository;
}

export interface GitHubPullRequest {
  url: string;
  id: number;
  node_id: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  number: number;
  state: "open" | "closed";
  locked: boolean;
  title: string;
  user: GitHubUser;
  body?: string;
  labels: GitHubLabel[];
  milestone?: GitHubMilestone;
  active_lock_reason?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  merged_at?: string;
  merge_commit_sha?: string;
  assignee?: GitHubUser;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  requested_teams: GitHubTeam[];
  head: GitHubPullRequestHead;
  base: GitHubPullRequestBase;
  _links: {
    self: { href: string };
    html: { href: string };
    issue: { href: string };
    comments: { href: string };
    review_comments: { href: string };
    review_comment: { href: string };
    commits: { href: string };
    statuses: { href: string };
  };
  author_association: string;
  auto_merge?: {
    enabled_by: GitHubUser;
    merge_method: "merge" | "squash" | "rebase";
    commit_title?: string;
    commit_message?: string;
  } | null;
  draft?: boolean;
  merged: boolean;
  mergeable?: boolean;
  rebaseable?: boolean;
  mergeable_state: string;
  merged_by?: GitHubUser;
  comments: number;
  review_comments: number;
  maintainer_can_modify: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitHubReview {
  id: number;
  node_id: string;
  user: GitHubUser;
  body?: string;
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED";
  html_url: string;
  pull_request_url: string;
  author_association: string;
  _links: {
    html: { href: string };
    pull_request: { href: string };
  };
  submitted_at: string;
  commit_id: string;
}

export interface GitHubRequestedReviewers {
  users: GitHubUser[];
  teams: GitHubTeam[];
}

export interface GitHubOAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

// Application-specific types
export interface GitHubPR {
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
  reviewStates?: Record<string, string>; // reviewer -> APPROVED/CHANGES_REQUESTED/etc
  hasApprovals?: boolean;
  hasChangesRequested?: boolean;
  checksStatus?: "pending" | "success" | "failure" | "error";
  additions?: number;
  deletions?: number;
}

export interface PRFilters {
  repositories?: string[];
  labels?: string[];
  titleKeywords?: string[];
  excludeAuthors?: string[];
  minAge?: number;
  maxAge?: number;
}
