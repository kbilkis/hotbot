import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

export const dashboard = style({
  minHeight: "calc(100vh - 80px)",
  paddingTop: 0,
  background: "transparent",
});

export const dashboardContainer = utils.container;

export const section = style({
  marginBottom: tokens.space[12],
});

export const sectionHeader = style([
  utils.flexBetween,
  {
    alignItems: "flex-start",
    padding: `0 ${tokens.space[8]}`,
    marginBottom: tokens.space[6],
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
        gap: tokens.space[4],
        alignItems: "stretch",
      },
    },
  },
]);

export const sectionContent = style([
  utils.flexCol,
  {
    alignItems: "start",
  },
]);

export const sectionTitle = style({
  fontSize: tokens.fontSize["2xl"],
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  marginBottom: tokens.space[1],
  lineHeight: tokens.lineHeight.tight,
});

export const sectionDescription = style({
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.normal,
  margin: 0,
});

export const integrationsGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: tokens.space[8],
  padding: `0 ${tokens.space[8]}`,
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
      padding: `0 ${tokens.space[4]}`,
    },
  },
});
