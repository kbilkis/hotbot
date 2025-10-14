import { style, globalStyle } from "@vanilla-extract/css";

// Channel Management (Slack/Discord)
export const channelsContainer = style({
  maxHeight: "300px",
  overflowY: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: "0.5rem",
  padding: "0.5rem",
});

export const channelsContainerScrollable = style([
  channelsContainer,
  {
    selectors: {
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f5f9",
        borderRadius: "3px",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#cbd5e1",
        borderRadius: "3px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#94a3b8",
      },
    },
  },
]);

export const channelItem = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem",
  borderRadius: "0.25rem",
  transition: "background 0.2s",
  ":hover": {
    background: "#f8fafc",
  },
});

export const channelInfo = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flex: 1,
});

export const channelIcon = style({
  fontSize: "1rem",
  color: "#6b7280",
});

export const channelName = style({
  fontSize: "0.875rem",
  color: "#374151",
  fontWeight: 500,
});

export const channelDescription = style({
  fontSize: "0.75rem",
  color: "#9ca3af",
  marginTop: "0.125rem",
});

export const channelActions = style({
  display: "flex",
  gap: "0.5rem",
});

export const testButton = style({
  padding: "0.25rem 0.75rem",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.75rem",
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    background: "#2563eb",
  },
  ":disabled": {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
});

export const testButtonTesting = style([
  testButton,
  {
    background: "#f59e0b",
    ":hover": {
      background: "#d97706",
    },
  },
]);

export const testResult = style({
  fontSize: "0.75rem",
  padding: "0.25rem 0.5rem",
  borderRadius: "0.25rem",
  fontWeight: 500,
});

export const testResultSuccess = style([
  testResult,
  {
    background: "#dcfce7",
    color: "#166534",
  },
]);

export const testResultError = style([
  testResult,
  {
    background: "#fef2f2",
    color: "#dc2626",
  },
]);

// Guild Management (Discord)
export const guildsContainer = style([channelsContainer]);

export const guildItem = style({
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  border: "1px solid #e5e7eb",
  borderRadius: "0.5rem",
  marginBottom: "1rem",
  transition: "all 0.2s",
  ":hover": {
    borderColor: "#d1d5db",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
});

export const guildHeader = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "0.75rem",
});

export const guildIcon = style({
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "#f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
});

export const guildName = style({
  fontSize: "1rem",
  fontWeight: 600,
  color: "#111827",
});

export const guildMemberCount = style({
  fontSize: "0.75rem",
  color: "#6b7280",
  marginLeft: "auto",
});

export const guildChannels = style({
  paddingLeft: "1rem",
});

export const guildChannelsTitle = style({
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.5rem",
});

// Access Level Selection
export const accessLevelButtons = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  marginBottom: "1rem",
});

export const accessLevelInfo = style({
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  padding: "1rem",
  marginBottom: "1rem",
});

export const accessOption = style({
  fontSize: "0.875rem",
  marginBottom: "0.5rem",
  lineHeight: 1.4,
  ":last-child": {
    marginBottom: 0,
  },
});

export const accessOptionStrong = style({
  color: "#374151",
  fontWeight: 600,
});

// Guild Selection
export const selectGuildButton = style({
  padding: "0.25rem 0.75rem",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.75rem",
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    background: "#2563eb",
  },
  ":disabled": {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
});

export const selectGuildButtonSelected = style([
  selectGuildButton,
  {
    background: "#10b981",
    ":hover": {
      background: "#059669",
    },
  },
]);

// Connection Method Tabs
export const connectionMethodTabs = style({
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1rem",
  borderBottom: "1px solid #e5e7eb",
});

export const methodTab = style({
  padding: "0.5rem 1rem",
  background: "transparent",
  border: "none",
  borderBottom: "2px solid transparent",
  cursor: "pointer",
  fontSize: "0.875rem",
  color: "#6b7280",
  transition: "all 0.2s",
  ":hover": {
    color: "#374151",
  },
});

export const methodTabActive = style([
  methodTab,
  {
    color: "#3b82f6",
    borderBottomColor: "#3b82f6",
    fontWeight: 500,
  },
]);

// Webhook Section
export const webhookConnectSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const discordSetupInfo = style({
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  padding: "1rem",
  fontSize: "0.875rem",
});

// Child element styles using globalStyle (industry standard)
globalStyle(`${discordSetupInfo} h3`, {
  margin: "0 0 0.5rem 0",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#374151",
});

globalStyle(`${discordSetupInfo} ol`, {
  paddingLeft: "1rem",
  margin: "0.5rem 0 0 0",
});

globalStyle(`${discordSetupInfo} li`, {
  marginBottom: "0.25rem",
  color: "#6b7280",
});

export const webhookConnectButton = style({
  padding: "0.75rem 1.5rem",
  background: "#7c3aed",
  color: "white",
  border: "none",
  borderRadius: "0.5rem",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    background: "#6d28d9",
  },
  ":disabled": {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
});
