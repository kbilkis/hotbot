import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

export const cronBuilder = style([utils.flexCol, utils.gap6]);

export const cronPresets = style({
  marginBottom: tokens.space[4],
});

export const presetButtons = style([
  utils.flex,
  utils.gap2,
  {
    flexWrap: "wrap",
    marginTop: tokens.space[2],
  },
]);

export const cronBuilderGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: tokens.space[4],
  marginBottom: tokens.space[4],
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const cronField = utils.flexCol;

export const cronLabel = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.gray700,
  marginBottom: tokens.space[2],
});

export const cronSelect = style([
  utils.inputBase,
  {
    padding: tokens.space[2],
    fontSize: tokens.fontSize.sm,
    cursor: "pointer",
  },
]);

export const cronExpression = style({
  marginTop: tokens.space[4],
});

export const cronExpressionLabel = style([
  utils.flex,
  utils.gap2,
  {
    alignItems: "center",
    marginBottom: tokens.space[2],
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.gray700,
  },
]);

export const scheduleUtc = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.colors.textLight,
  fontWeight: tokens.fontWeight.normal,
});

export const cronInput = style([
  utils.inputBase,
  {
    fontFamily: "monospace",
    background: tokens.colors.gray50,
    selectors: {
      "&:focus": {
        background: tokens.colors.white,
      },
    },
  },
]);

export const cronInputError = style([
  cronInput,
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

export const cronDescription = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
  marginTop: tokens.space[2],
  fontStyle: "italic",
});

export const timezoneSection = style({
  marginBottom: tokens.space[4],
});

export const timezoneLabel = style([
  utils.flex,
  utils.gap2,
  {
    alignItems: "center",
    marginBottom: tokens.space[2],
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.gray700,
  },
]);

export const timezoneSelect = style([
  cronSelect,
  {
    width: "100%",
  },
]);

export const fieldError = style({
  color: tokens.colors.error,
  fontSize: tokens.fontSize.sm,
  marginTop: tokens.space[1],
  fontWeight: tokens.fontWeight.medium,
});
