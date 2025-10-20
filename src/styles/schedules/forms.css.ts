import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

// Form Groups and Inputs
export const formGroup = style({
  marginBottom: tokens.space[6],
});

export const formLabel = style({
  display: "block",
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.text,
  marginBottom: tokens.space[2],
});

export const formLabelRow = style([
  utils.flex,
  {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.space[2],
  },
]);

export const formInput = utils.inputBase;

export const formInputError = style([
  formInput,
  {
    borderColor: tokens.colors.error,
    selectors: {
      "&:focus": {
        borderColor: tokens.colors.error,
        boxShadow: `0 0 0 3px rgba(239, 68, 68, 0.1)`,
      },
    },
  },
]);

export const formSelect = style([
  formInput,
  {
    cursor: "pointer",
  },
]);

export const formHelp = style({
  display: "block",
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.sm,
  marginTop: tokens.space[1],
  lineHeight: tokens.lineHeight.normal,
});

export const fieldError = style({
  color: tokens.colors.error,
  fontSize: tokens.fontSize.sm,
  marginTop: tokens.space[1],
  fontWeight: tokens.fontWeight.medium,
});

// Form Sections
export const formSection = style({
  marginBottom: tokens.space[8],
});

export const formRow = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: tokens.space[4],
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const loadingText = style({
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.sm,
  fontStyle: "italic",
  padding: tokens.space[2],
  textAlign: "center",
});

// Repository and Channel Selection
export const repositorySelection = style({
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.md,
  padding: tokens.space[4],
  background: tokens.colors.surfaceHover,
});

export const channelSelection = style({
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.md,
  padding: tokens.space[4],
  background: tokens.colors.surfaceHover,
});

export const checkboxGroup = style([
  utils.flexCol,
  {
    gap: tokens.space[2],
    maxHeight: "200px",
    overflowY: "auto",
    padding: tokens.space[2],
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    background: tokens.colors.white,
  },
]);

export const checkboxLabel = style([
  utils.flex,
  {
    alignItems: "center",
    gap: tokens.space[2],
    padding: tokens.space[1],
    cursor: "pointer",
    fontSize: tokens.fontSize.sm,
    selectors: {
      "&:hover": {
        background: tokens.colors.background,
        borderRadius: tokens.borderRadius.sm,
      },
    },
  },
]);

export const noRepositories = style([
  utils.textCenter,
  {
    color: tokens.colors.textLight,
    fontSize: tokens.fontSize.sm,
    fontStyle: "italic",
    padding: tokens.space[4],
  },
]);

export const selectProviderFirst = style([
  utils.textCenter,
  {
    color: tokens.colors.textLight,
    fontSize: tokens.fontSize.sm,
    fontStyle: "italic",
    padding: tokens.space[4],
  },
]);

export const noChannels = style([
  utils.textCenter,
  {
    color: tokens.colors.textLight,
    fontSize: tokens.fontSize.sm,
    fontStyle: "italic",
    padding: tokens.space[4],
  },
]);

// Discord-specific styles
export const discordSelection = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

// Refresh and Error Handling
export const refreshButton = style({
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: tokens.fontSize.lg,
  color: tokens.colors.textMuted,
  padding: tokens.space[1],
  borderRadius: tokens.borderRadius.sm,
  transition: "all 0.2s ease",
  selectors: {
    "&:hover:not(:disabled)": {
      color: tokens.colors.primary,
      background: tokens.colors.surfaceHover,
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});

export const errorState = style([
  utils.textCenter,
  {
    padding: tokens.space[4],
    border: `1px solid ${tokens.colors.error}`,
    borderRadius: tokens.borderRadius.md,
    background: `rgba(239, 68, 68, 0.05)`,
  },
]);

export const errorMessage = style({
  color: tokens.colors.error,
  fontSize: tokens.fontSize.sm,
  marginBottom: tokens.space[2],
});

export const retryButton = style({
  background: tokens.colors.error,
  color: tokens.colors.white,
  border: "none",
  padding: `${tokens.space[1]} ${tokens.space[3]}`,
  borderRadius: tokens.borderRadius.sm,
  fontSize: tokens.fontSize.sm,
  cursor: "pointer",
  transition: "all 0.2s ease",
  selectors: {
    "&:hover": {
      background: tokens.colors.errorHover,
    },
  },
});
