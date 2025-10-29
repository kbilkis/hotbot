import { style, globalStyle } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

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
    maxWidth: "850px",
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

export const modalClose = style({
  background: "transparent",
  color: tokens.colors.textMuted,
  border: "none",
  borderRadius: tokens.borderRadius.base,
  cursor: "pointer",
  padding: tokens.space[1],
  fontSize: tokens.fontSize["2xl"],
  fontWeight: tokens.fontWeight.medium,
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  outline: "none",
  selectors: {
    "&:hover": {
      background: tokens.colors.gray100,
    },
    "&:focus": {
      outline: `2px solid ${tokens.colors.primary}`,
      outlineOffset: "2px",
    },
  },
});

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

export const formInput = style([
  utils.inputBase,
  {
    paddingLeft: tokens.space[8],
  },
]);

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
  color: tokens.colors.textMuted,
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

export const manualConnectSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const helpSection = style({
  marginTop: "0.5rem",
});

export const helpContent = style({
  fontSize: "0.75rem",
  color: tokens.colors.textMuted,
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
  color: tokens.colors.textMuted,
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

export const itemCount = style({
  fontSize: "0.75rem",
  color: tokens.colors.textMuted,
  marginBottom: "0.5rem",
  fontWeight: 500,
});

export const modalFooterError = style({
  marginBottom: "1rem",
  marginRight: "auto",
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

export const connectionTypeSection = style({
  marginBottom: tokens.space[6],
  padding: tokens.space[4],
  background: tokens.colors.gray50,
  borderRadius: tokens.borderRadius.lg,
  border: `1px solid ${tokens.colors.borderLight}`,
});

export const sectionTitle = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.bold,
  color: tokens.colors.text,
  margin: 0,
  marginBottom: tokens.space[2],
});

export const connectionOptions = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
});

export const connectionOption = style({
  display: "flex",
  alignItems: "flex-start",
  gap: tokens.space[3],
  padding: tokens.space[4],
  background: tokens.colors.white,
  border: `2px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
  cursor: "pointer",
  transition: "all 0.2s ease",
  selectors: {
    "&:hover": {
      borderColor: tokens.colors.primary,
      background: tokens.colors.primaryLight,
    },
    "&:has(input:checked)": {
      borderColor: tokens.colors.primary,
      background: tokens.colors.primaryLight,
    },
  },
});

export const connectionOptionContent = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  flex: 1,
});

globalStyle(`${connectionOptionContent} strong`, {
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
});

globalStyle(`${connectionOptionContent} span`, {
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
});

globalStyle(`${connectionOptionContent} small`, {
  fontSize: tokens.fontSize.xs,
  color: tokens.colors.success,
  fontWeight: tokens.fontWeight.medium,
});

export const sectionDescription = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
  margin: 0,
  marginBottom: tokens.space[5],
  lineHeight: "1.4",
  fontWeight: tokens.fontWeight.normal,
});

export const personalAccountSection = style({
  marginTop: tokens.space[6],
  padding: tokens.space[4],
  background: tokens.colors.gray50,
  borderRadius: tokens.borderRadius.lg,
  border: `1px solid ${tokens.colors.border}`,
});

export const tokenSection = style({
  marginTop: tokens.space[4],
});

export const tokenDetails = style({
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.md,
  overflow: "hidden",
});

export const tokenSummary = style({
  padding: tokens.space[3],
  background: tokens.colors.gray50,
  cursor: "pointer",
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.textMuted,
  userSelect: "none",
  ":hover": {
    background: tokens.colors.gray100,
  },
});

export const tokenContent = style({
  padding: tokens.space[4],
  background: tokens.colors.white,
  borderTop: `1px solid ${tokens.colors.border}`,
});

export const personalAccountHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: tokens.space[4],
});

export const personalAccountTitle = style({
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.textMuted,
  margin: 0,
});

export const personalAccountOptions = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
});

export const tokenInputGroup = style({
  display: "flex",
  gap: tokens.space[2],
  alignItems: "center",
});

export const tokenInput = style({
  flex: 1,
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.md,
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.text,
  background: tokens.colors.white,
  ":focus": {
    outline: "none",
    borderColor: tokens.colors.borderFocus,
    boxShadow: `0 0 0 3px ${tokens.colors.primaryLight}`,
  },
  "::placeholder": {
    color: tokens.colors.textLight,
  },
});

export const tokenHelp = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.colors.textMuted,
  marginTop: tokens.space[2],
});

export const primarySection = style({
  marginBottom: tokens.space[8],
});
