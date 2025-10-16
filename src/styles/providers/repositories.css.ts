import { style } from "@vanilla-extract/css";

import { tokens, utils, iconStyles } from "../theme/index.css";

// Repository Management
export const repositoriesSection = style({
  marginTop: tokens.space[2],
});

export const repositoriesLoading = style([
  utils.textCenter,
  {
    padding: tokens.space[4],
    background: tokens.colors.gray50,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    color: tokens.colors.textMuted,
    fontSize: tokens.fontSize.sm,
  },
]);

export const repositoriesError = style([
  utils.textCenter,
  {
    padding: tokens.space[4],
    background: tokens.colors.errorBg,
    border: `1px solid ${tokens.colors.error}`,
    borderRadius: tokens.borderRadius.lg,
    color: tokens.colors.error,
    fontSize: tokens.fontSize.sm,
  },
]);

export const repositoriesEmpty = style([
  utils.textCenter,
  {
    padding: tokens.space[4],
    background: tokens.colors.gray50,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    color: tokens.colors.textMuted,
    fontSize: tokens.fontSize.sm,
  },
]);

export const repositoriesList = style({
  marginTop: tokens.space[4],
});

export const repositoriesCount = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
  marginBottom: tokens.space[3],
});

export const repositoriesContainer = style({
  maxHeight: "300px",
  overflowY: "auto",
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
  padding: tokens.space[2],
});

export const repositoryItem = style([
  utils.flex,
  utils.gap2,
  {
    alignItems: "center",
    padding: tokens.space[2],
    borderRadius: tokens.borderRadius.base,
    transition: "background 0.2s",
    selectors: {
      "&:hover": {
        background: tokens.colors.gray100,
      },
    },
  },
]);

export const repoIcon = style([
  iconStyles.base,
  {
    color: tokens.colors.textMuted,
  },
]);

export const repoName = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.gray700,
  fontFamily: "monospace",
});
