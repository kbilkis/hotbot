// Centralized Pull Request types for the entire application

export interface PullRequest {
  id: string;
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

export interface PRCategory {
  name: string;
  emoji: string;
  prs: PullRequest[];
}
