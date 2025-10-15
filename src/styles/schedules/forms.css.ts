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

export const formSectionTitle = style({
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  marginBottom: tokens.space[4],
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
