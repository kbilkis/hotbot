export interface Provider {
  id: string;
  name: string;
  type: "git" | "messaging";
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
