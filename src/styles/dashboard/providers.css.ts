import { style } from "@vanilla-extract/css";

import { tokens, badgeStyles, utils, iconStyles } from "../theme/index.css";

export const providerSection = utils.card;

export const providerSectionTitle = style({
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  marginBottom: tokens.space[1],
  lineHeight: tokens.lineHeight.tight,
});

export const providerSectionDescription = style({
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.sm,
  marginBottom: tokens.space[6],
  lineHeight: tokens.lineHeight.normal,
});

export const providerList = style([utils.flexCol, utils.gap4]);

export const providerCard = style([
  utils.flexBetween,
  {
    alignItems: "center",
    padding: `${tokens.space[4]} ${tokens.space[6]}`,
    background: tokens.colors.gray50,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    transition: "all 0.2s ease",
    selectors: {
      "&:hover": {
        boxShadow: tokens.boxShadow.md,
      },
    },
  },
]);

export const providerInfo = style([
  utils.flex,
  utils.gap3,
  {
    alignItems: "center",
  },
  {
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
        alignItems: "flex-start",
      },
    },
  },
]);

export const providerIcon = style([
  iconStyles.base,
  {
    width: tokens.space[6],
    height: tokens.space[6],
    marginRight: tokens.space[2],
  },
]);

export const providerLogo = style({
  width: tokens.space[8],
  height: tokens.space[8],
  minWidth: "40px",
  minHeight: "100px",
  objectFit: "contain",
  "@media": {
    "(max-width: 768px)": {
      minHeight: "auto",
    },
  },
});

export const providerLogoGitlab = style([
  providerLogo,
  {
    minWidth: "70px",
  },
]);

export const providerName = style({
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.text,
});

const connectionStatus = badgeStyles.neutral;

export const connectionStatusConnected = style([
  connectionStatus,
  {
    background: tokens.colors.successBg,
    color: tokens.colors.success,
  },
]);
