import { style, globalStyle } from "@vanilla-extract/css";

import { fadeIn } from "../theme/animations.css";
import { tokens, utils, iconStyles } from "../theme/index.css";

// Auth Section
export const authSection = style([
  utils.flexBetween,
  utils.gap4,
  {
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
        gap: tokens.space[2],
        alignItems: "flex-end",
      },
    },
  },
]);

export const userEmail = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
  fontWeight: tokens.fontWeight.medium,
  "@media": {
    "(max-width: 768px)": {
      fontSize: tokens.fontSize.xs,
    },
  },
});

// Auth Callback Styles

export const statusIcon = style([
  iconStyles.xl,
  {
    marginBottom: tokens.space[4],
    animation: `${fadeIn} 0.5s ease-out`,
  },
]);

// Loading States
export const loadingText = style({
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.medium,
});

export const successText = style({
  color: tokens.colors.success,
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.medium,
});

export const errorText = style({
  color: tokens.colors.error,
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.medium,
});

// Upgrade Result Pages
export const upgradeResultPage = style([
  utils.flexCenter,
  {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${tokens.colors.gray50} 0%, ${tokens.colors.gray200} 100%)`,
    padding: tokens.space[8],
  },
]);

const upgradeResultContent = style({});

globalStyle(`${upgradeResultContent} h1`, {
  margin: `${tokens.space[4]} 0`,
  fontSize: tokens.fontSize["4xl"],
  fontWeight: tokens.fontWeight.bold,
  color: tokens.colors.text,
});

globalStyle(`${upgradeResultContent} h3`, {
  margin: `${tokens.space[6]} 0 ${tokens.space[4]} 0`,
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.gray700,
});

globalStyle(`${upgradeResultContent} p`, {
  margin: `${tokens.space[4]} 0`,
  color: tokens.colors.textMuted,
  lineHeight: tokens.lineHeight.normal,
  fontSize: tokens.fontSize.base,
});

export const upgradeResultContentSuccess = style([upgradeResultContent]);

globalStyle(`${upgradeResultContentSuccess} h1`, {
  color: tokens.colors.success,
});

export const upgradeResultContentCancel = style([upgradeResultContent]);

globalStyle(`${upgradeResultContentCancel} h1`, {
  color: tokens.colors.error,
});

export const upgradeSuccessIcon = style({
  fontSize: tokens.fontSize["4xl"],
  color: tokens.colors.success,
  marginBottom: tokens.space[4],
  display: "block",
  fontWeight: tokens.fontWeight.bold,
});

export const cancelIcon = style({
  fontSize: tokens.fontSize["4xl"],
  color: tokens.colors.error,
  marginBottom: tokens.space[4],
  display: "block",
  fontWeight: tokens.fontWeight.bold,
});

export const featureList = style({
  textAlign: "left",
  margin: `${tokens.space[6]} 0`,
  padding: tokens.space[6],
  background: tokens.colors.gray50,
  borderRadius: tokens.borderRadius.xl,
  border: `1px solid ${tokens.colors.border}`,
});

globalStyle(`${featureList} li`, {
  margin: `${tokens.space[2]} 0`,
  color: tokens.colors.gray700,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  paddingLeft: tokens.space[4],
  position: "relative",
});

globalStyle(`${featureList} li::before`, {
  content: '"✓"',
  position: "absolute",
  left: 0,
  color: tokens.colors.success,
  fontWeight: tokens.fontWeight.bold,
});

export const upgradeBenefits = style({
  margin: `${tokens.space[8]} 0`,
  padding: tokens.space[6],
  background: tokens.colors.warningBg,
  borderRadius: tokens.borderRadius.xl,
  border: `1px solid ${tokens.colors.warning}`,
});

export const redirectText = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textLight,
  fontStyle: "italic",
  margin: `${tokens.space[8]} 0 ${tokens.space[4]} 0`,
});

export const actionButtons = style([
  utils.flex,
  utils.gap4,
  {
    justifyContent: "center",
    marginTop: tokens.space[8],
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
      },
    },
  },
]);
