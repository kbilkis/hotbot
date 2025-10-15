import { style, globalStyle } from "@vanilla-extract/css";

import { tokens, buttonStyles, utils } from "../theme/index.css";

// Modal Structure
export const modalOverlay = style([
  utils.flexCenter,
  {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: tokens.zIndex.modal,
    backdropFilter: "blur(4px)",
  },
]);

export const modalContent = style([
  utils.flexCol,
  {
    background: tokens.colors.white,
    borderRadius: tokens.borderRadius["2xl"],
    boxShadow: tokens.boxShadow["2xl"],
    maxWidth: "650px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "hidden",
  },
]);

export const modalHeader = style([
  utils.flexBetween,
  {
    alignItems: "center",
    padding: `${tokens.space[8]} ${tokens.space[8]} ${tokens.space[4]}`,
    borderBottom: `1px solid ${tokens.colors.border}`,
    flexShrink: 0,
  },
]);

export const modalTitle = style({
  fontSize: tokens.fontSize["2xl"],
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  margin: 0,
});

export const modalClose = style([
  buttonStyles.ghost,
  {
    background: "none",
    border: "none",
    fontSize: tokens.fontSize["2xl"],
    color: tokens.colors.textMuted,
    cursor: "pointer",
    padding: tokens.space[1],
    borderRadius: tokens.borderRadius.base,
    selectors: {
      "&:hover": {
        background: tokens.colors.gray100,
      },
    },
  },
]);

export const modalBody = style({
  padding: `${tokens.space[6]} ${tokens.space[8]}`,
  overflowY: "auto",
  flex: 1,
});

export const modalDescription = style({
  color: tokens.colors.textMuted,
  marginBottom: tokens.space[8],
  lineHeight: tokens.lineHeight.normal,
});

export const modalFooter = style([
  utils.flex,
  utils.gap4,
  {
    padding: `${tokens.space[4]} ${tokens.space[8]} ${tokens.space[8]}`,
    justifyContent: "flex-end",
    borderTop: `1px solid ${tokens.colors.borderLight}`,
    flexShrink: 0,
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
      },
    },
  },
]);

// Form Elements
export const formGroup = style({
  marginBottom: tokens.space[6],
});

export const formLabel = style({
  display: "block",
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.text,
  marginBottom: tokens.space[2],
});

export const formInput = utils.inputBase;

export const formHelp = style({
  display: "block",
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.sm,
  marginTop: tokens.space[1],
  lineHeight: tokens.lineHeight.normal,
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
  color: tokens.colors.error,
  fontSize: tokens.fontSize.sm,
  marginTop: tokens.space[2],
  fontWeight: tokens.fontWeight.medium,
});

// Provider Display
export const providerDisplay = style([
  utils.flex,
  utils.gap3,
  {
    alignItems: "center",
    padding: tokens.space[4],
    background: tokens.colors.gray50,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    marginBottom: tokens.space[4],
  },
]);

const connectionStatus = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.semibold,
});

export const connectionStatusConnected = style([
  connectionStatus,
  {
    color: tokens.colors.success,
  },
]);

export const teamName = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
});

// Buttons
export const connectButton = buttonStyles.primary;
export const disconnectButton = buttonStyles.danger;
export const cancelButton = buttonStyles.outline;

const oauthButton = style([
  buttonStyles.primary,
  {
    background: "#24292f", // GitHub dark
    selectors: {
      "&:hover": {
        background: "#1c2128",
        transform: "translateY(-1px)",
      },
      "&:disabled": {
        background: tokens.colors.gray400,
        cursor: "not-allowed",
      },
    },
  },
]);

export const oauthButtonPrimary = style([
  oauthButton,
  {
    background: tokens.colors.success,
    selectors: {
      "&:hover": {
        background: tokens.colors.successHover,
      },
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
  buttonStyles.ghost,
  {
    background: "transparent",
    color: tokens.colors.textMuted,
    border: `1px dashed ${tokens.colors.gray300}`,
    fontSize: tokens.fontSize.sm,
    padding: `${tokens.space[2]} ${tokens.space[4]}`,
    selectors: {
      "&:hover": {
        borderColor: tokens.colors.primary,
        color: tokens.colors.primary,
      },
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
  buttonStyles.ghost,
  {
    background: "transparent",
    color: tokens.colors.textMuted,
    border: "none",
    fontSize: tokens.fontSize.xs,
    padding: `${tokens.space[1]} ${tokens.space[2]}`,
    selectors: {
      "&:hover": {
        color: tokens.colors.primary,
      },
    },
  },
]);

export const manualConnectSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const manualConnectButton = style([
  buttonStyles.primary,
  {
    background: tokens.colors.info,
    selectors: {
      "&:hover": {
        background: "#2563eb",
      },
      "&:disabled": {
        background: tokens.colors.gray400,
        cursor: "not-allowed",
      },
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
  buttonStyles.danger,
  {
    fontSize: tokens.fontSize.xs,
    padding: `${tokens.space[1]} ${tokens.space[3]}`,
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
