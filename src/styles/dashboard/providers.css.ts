import { style } from "@vanilla-extract/css";

import {
  tokens,
  buttonStyles,
  badgeStyles,
  utils,
  iconStyles,
} from "../theme/index.css";

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
        transform: "translateY(-2px)",
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

export const connectButton = style([
  buttonStyles.primary,
  {
    background: tokens.colors.success,
    padding: `${tokens.space[2]} ${tokens.space[4]}`,
    selectors: {
      "&:hover": {
        background: tokens.colors.successHover,
        transform: "translateY(-1px)",
      },
    },
  },
]);

export const connectButtonConnected = style([
  buttonStyles.outline,
  {
    background: tokens.colors.white,
    color: tokens.colors.success,
    border: `1px solid ${tokens.colors.success}`,
    selectors: {
      "&:hover": {
        color: tokens.colors.successHover,
        borderColor: tokens.colors.successHover,
        background: tokens.colors.white,
      },
    },
  },
]);

export const connectButtonComingSoon = style([
  buttonStyles.secondary,
  {
    backgroundColor: tokens.colors.gray100,
    color: tokens.colors.gray400,
    cursor: "not-allowed",
    opacity: 0.6,
    selectors: {
      "&:hover": {
        transform: "none",
        background: tokens.colors.gray100,
      },
    },
  },
]);
