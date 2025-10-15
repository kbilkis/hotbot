import { style, globalStyle } from "@vanilla-extract/css";

// Modal Structure
export const modalOverlay = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(4px)",
});

export const modalContent = style({
  background: "white",
  borderRadius: "1rem",
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
  maxWidth: "650px",
  width: "90%",
  maxHeight: "90vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const modalHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "2rem 2rem 1rem",
  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
  flexShrink: 0,
});

export const modalTitle = style({
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#111827",
  margin: 0,
});

export const modalClose = style({
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  color: "#6b7280",
  cursor: "pointer",
  padding: "0.25rem",
  borderRadius: "0.25rem",
  transition: "all 0.2s",
  ":hover": {
    background: "rgba(107, 114, 128, 0.1)",
  },
});

export const modalBody = style({
  padding: "1.5rem 2rem",
  overflowY: "auto",
  flex: 1,
});

export const modalDescription = style({
  color: "#6b7280",
  marginBottom: "2rem",
  lineHeight: 1.6,
});

export const modalFooter = style({
  padding: "1rem 2rem 2rem",
  display: "flex",
  justifyContent: "flex-end",
  gap: "1rem",
  borderTop: "1px solid rgba(148, 163, 184, 0.1)",
  flexShrink: 0,
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
    },
  },
});

// Form Elements
export const formGroup = style({
  marginBottom: "1.5rem",
});

export const formLabel = style({
  display: "block",
  fontWeight: 500,
  color: "#111827",
  marginBottom: "0.5rem",
});

export const formInput = style({
  width: "100%",
  padding: "0.75rem",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "0.5rem",
  fontSize: "1rem",
  transition: "all 0.2s",
  background: "white",
  ":focus": {
    outline: "none",
    borderColor: "#ff8000",
    boxShadow: "0 0 0 3px rgba(255, 128, 0, 0.1)",
  },
});

export const formHelp = style({
  display: "block",
  color: "#6b7280",
  fontSize: "0.875rem",
  marginTop: "0.25rem",
  lineHeight: 1.4,
});

export const inputWithIcon = style({
  position: "relative",
});

export const inputIcon = style({
  position: "absolute",
  left: "0.75rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#6b7280",
});

export const required = style({
  color: "#ef4444",
});

export const errorMessage = style({
  color: "#ef4444",
  fontSize: "0.875rem",
  marginTop: "0.5rem",
  fontWeight: 500,
});

// Provider Display
export const providerDisplay = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "1rem",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  marginBottom: "1rem",
});

const connectionStatus = style({
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const connectionStatusConnected = style([
  connectionStatus,
  {
    color: "#10b981",
  },
]);

export const teamName = style({
  fontSize: "0.875rem",
  color: "#6b7280",
});

// Buttons
const button = style({
  padding: "0.75rem 1.5rem",
  borderRadius: "0.5rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  border: "none",
  fontSize: "1rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
});

export const connectButton = style([
  button,
  {
    background: "#ff8000",
    color: "white",
    ":hover": {
      background: "#cc5500",
    },
    ":disabled": {
      background: "#9ca3af",
      cursor: "not-allowed",
    },
  },
]);

export const disconnectButton = style([
  button,
  {
    background: "#ef4444",
    color: "white",
    ":hover": {
      background: "#dc2626",
      transform: "translateY(-1px)",
    },
    ":disabled": {
      background: "#9ca3af",
      cursor: "not-allowed",
    },
  },
]);

export const cancelButton = style([
  button,
  {
    background: "transparent",
    color: "#6b7280",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    ":hover": {
      borderColor: "#ff8000",
      color: "#ff8000",
    },
  },
]);

const oauthButton = style([
  button,
  {
    background: "#24292f",
    color: "white",
    ":hover": {
      background: "#1c2128",
      transform: "translateY(-1px)",
    },
    ":disabled": {
      background: "#9ca3af",
      cursor: "not-allowed",
    },
  },
]);

export const oauthButtonPrimary = style([
  oauthButton,
  {
    background: "#10b981",
    ":hover": {
      background: "#059669",
    },
  },
]);

// Provider Branding
export const providerBranded = style({
  background: "var(--provider-color, #4f46e5) !important",
  borderColor: "var(--provider-color, #4f46e5) !important",
  color: "white !important",
  ":hover": {
    background: "var(--provider-accent-color, #4338ca) !important",
    borderColor: "var(--provider-accent-color, #4338ca) !important",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  ":disabled": {
    background: "var(--provider-bg-color, #f3f4f6) !important",
    borderColor: "var(--provider-bg-color, #f3f4f6) !important",
    color: "var(--provider-color, #6b7280) !important",
    opacity: 0.6,
    transform: "none",
    boxShadow: "none",
  },
});

export const oauthButtonContent = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  justifyContent: "center",
  width: "100%",
});

export const providerLogoButton = style({
  height: "2rem",
});

export const providerLogoButtonGitlab = style([
  providerLogoButton,
  {
    height: "3rem !important",
    margin: "-0.75rem 0rem",
  },
]);

export const oauthButtonLogo = style({
  height: "1.25rem",
  width: "auto",
});

// Alternative Connection Section
export const alternativeSection = style({
  marginTop: "1.5rem",
  paddingTop: "1.5rem",
  borderTop: "1px solid rgba(148, 163, 184, 0.2)",
});

export const showAlternativeButton = style([
  button,
  {
    background: "transparent",
    color: "#6b7280",
    border: "1px dashed rgba(148, 163, 184, 0.5)",
    fontSize: "0.875rem",
    padding: "0.5rem 1rem",
    ":hover": {
      borderColor: "#ff8000",
      color: "#ff8000",
    },
  },
]);

export const manualConnectionWrapper = style({
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "0.5rem",
  padding: "1rem",
  background: "#f8fafc",
});

export const alternativeHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#374151",
});

export const hideAlternativeButton = style([
  button,
  {
    background: "transparent",
    color: "#6b7280",
    border: "none",
    fontSize: "0.75rem",
    padding: "0.25rem 0.5rem",
    ":hover": {
      color: "#ff8000",
    },
  },
]);

export const manualConnectSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const manualConnectButton = style([
  button,
  {
    background: "#3b82f6",
    color: "white",
    ":hover": {
      background: "#2563eb",
    },
    ":disabled": {
      background: "#9ca3af",
      cursor: "not-allowed",
    },
  },
]);

export const helpSection = style({
  marginTop: "0.5rem",
});

export const helpContent = style({
  fontSize: "0.75rem",
  color: "#6b7280",
  lineHeight: 1.4,
});

globalStyle(`${helpContent} ol`, {
  paddingLeft: "1rem",
  marginTop: "0.5rem",
});

globalStyle(`${helpContent} li`, {
  marginBottom: "0.25rem",
});

globalStyle(`${helpContent} ul`, {
  paddingLeft: "1rem",
  marginTop: "0.25rem",
});

globalStyle(`${helpContent} code`, {
  background: "#f1f5f9",
  padding: "0.125rem 0.25rem",
  borderRadius: "0.25rem",
  fontSize: "0.6875rem",
  fontFamily: "monospace",
});

export const helpLink = style({
  color: "#3b82f6",
  textDecoration: "underline",
  ":hover": {
    color: "#2563eb",
  },
});

// States
export const loadingState = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  color: "#6b7280",
  fontSize: "0.875rem",
});

export const errorState = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "0.5rem",
  color: "#dc2626",
  fontSize: "0.875rem",
});

export const emptyState = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  color: "#9ca3af",
  fontSize: "0.875rem",
  fontStyle: "italic",
});

export const retryButton = style([
  button,
  {
    background: "#ef4444",
    color: "white",
    fontSize: "0.75rem",
    padding: "0.25rem 0.75rem",
    ":hover": {
      background: "#dc2626",
    },
  },
]);

export const itemCount = style({
  fontSize: "0.75rem",
  color: "#6b7280",
  marginBottom: "0.5rem",
  fontWeight: 500,
});

// Modal Footer
export const modalFooterError = style({
  width: "100%",
  marginBottom: "1rem",
});

export const modalFooterButtons = style({
  display: "flex",
  gap: "1rem",
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
    },
  },
});
