export interface Provider {
  id: string;
  name: string;
  type: "slack" | "teams" | "discord";
  connected: boolean;
}
