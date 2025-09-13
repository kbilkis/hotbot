export interface Provider {
  id: string;
  name: string;
  type: "slack" | "teams" | "discord";
  connected: boolean;
  icon: string;
}

export interface Schedule {
  id: string;
  name: string;
  status: "active" | "paused" | "error";
  lastRun?: string;
  nextRun?: string;
}

export interface PRFilters {
  labels?: string[];
  titleKeywords?: string[];
}

export interface CronJob extends Schedule {
  cronExpression: string;
  gitProviderId: string;
  repositories: string[];
  messagingProviderId: string;
  escalationProviderId?: string;
  escalationDays?: number;
  prFilters?: PRFilters;
  sendWhenEmpty: boolean;
}
