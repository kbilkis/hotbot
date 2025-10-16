import { style } from "@vanilla-extract/css";

import { tokens, badgeStyles, utils } from "../theme/index.css";

export const filterBuilder = style([utils.flexCol, utils.gap6]);

export const filterSection = style([utils.flexCol, utils.gap4]);

export const filterInputGroup = style([
  utils.flex,
  utils.gap2,
  {
    alignItems: "flex-start",
  },
]);

export const filterInput = style([
  utils.inputBase,
  {
    flex: 1,
    fontSize: tokens.fontSize.sm,
  },
]);

export const commonFilters = style({
  marginTop: tokens.space[2],
});

export const commonFiltersLabel = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.colors.textMuted,
  marginBottom: tokens.space[2],
  display: "block",
});

export const commonFilterButtons = style([
  utils.flex,
  utils.gap2,
  {
    flexWrap: "wrap",
  },
]);

export const filterItems = style([
  utils.flex,
  utils.gap2,
  {
    flexWrap: "wrap",
    marginTop: tokens.space[3],
  },
]);

export const filterItem = style([
  badgeStyles.info,
  utils.flex,
  utils.gap2,
  {
    alignItems: "center",
    background: tokens.colors.infoBg,
    border: `1px solid ${tokens.colors.info}`,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.info,
  },
]);

export const removeTag = style({
  background: "none",
  border: "none",
  color: tokens.colors.textMuted,
  cursor: "pointer",
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.bold,
  padding: "0",
  marginLeft: tokens.space[1],
  transition: "color 0.2s",
  selectors: {
    "&:hover": {
      color: tokens.colors.error,
    },
  },
});

export const filterPreview = style({
  marginTop: tokens.space[6],
  padding: tokens.space[4],
  background: tokens.colors.gray50,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
});

export const filterPreviewTitle = style({
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  marginBottom: tokens.space[2],
});

export const filterPreviewText = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
  lineHeight: tokens.lineHeight.normal,
});

export const filterPreviewCode = style({
  fontFamily: "monospace",
  background: tokens.colors.gray100,
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: tokens.borderRadius.base,
  fontSize: tokens.fontSize.sm,
});

export const filterLabel = style({
  display: "block",
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.text,
  marginBottom: tokens.space[2],
});

export const filterHelp = style({
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.sm,
  marginBottom: tokens.space[3],
  lineHeight: tokens.lineHeight.normal,
});
