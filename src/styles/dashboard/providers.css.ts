import { style } from "@vanilla-extract/css";

export const providerSection = style({
  background: "#ffffff",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "1rem",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
});

export const providerSectionTitle = style({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "0.25rem",
  lineHeight: 1.2,
});

export const providerSectionDescription = style({
  color: "#6b7280",
  fontSize: "0.8125rem",
  marginBottom: "1.5rem",
  lineHeight: 1.4,
});

export const providerList = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const providerCard = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 1.5rem",
  background: "#f9fafb",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "0.5rem",
  transition: "all 0.2s ease",
  ":hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
});

export const providerInfo = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
});

export const providerIcon = style({
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.5rem",
  height: "1.5rem",
  marginRight: "0.5rem",
});

export const providerLogo = style({
  width: "2rem",
  height: "2rem",
  minWidth: "40px",
  minHeight: "100px",
  objectFit: "contain",
});

export const providerLogoGitlab = style([
  providerLogo,
  {
    minWidth: "70px",
  },
]);

export const providerName = style({
  fontWeight: 500,
  color: "#111827",
});

export const connectionStatus = style({
  fontSize: "0.75rem",
  fontWeight: 600,
  padding: "0.25rem 0.5rem",
  borderRadius: "0.25rem",
});

export const connectionStatusConnected = style([
  connectionStatus,
  {
    background: "rgba(16, 185, 129, 0.1)",
    color: "#10b981",
  },
]);

export const connectButton = style({
  background: "#10b981",
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "0.375rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    background: "#059669",
    transform: "translateY(-1px)",
  },
});

export const connectButtonConnected = style([
  connectButton,
  {
    background: "white",
    color: "#10b981",
    border: "1px solid #10b981",
    ":hover": {
      color: "#059669",
      borderColor: "#059669",
      background: "white",
    },
  },
]);

export const connectButtonComingSoon = style([
  connectButton,
  {
    backgroundColor: "#f5f5f5",
    color: "#999",
    cursor: "not-allowed",
    opacity: 0.6,
    ":hover": {
      transform: "none",
      background: "#f5f5f5",
    },
  },
]);
