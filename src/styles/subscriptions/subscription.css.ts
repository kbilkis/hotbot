import { style, globalStyle } from "@vanilla-extract/css";

import { spin } from "../theme/animations.css";
import {
  tokens,
  buttonStyles,
  badgeStyles,
  utils,
  iconStyles,
} from "../theme/index.css";

// Subscription Header
export const subscriptionHeader = style([
  utils.flexBetween,
  {
    marginBottom: tokens.space[4],
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: tokens.space[2],
      },
    },
  },
]);

export const tierBadgeContainer = style([
  utils.flex,
  utils.gap2,
  {
    alignItems: "center",
  },
]);

// Tier Badges
const tierBadgeBase = style([
  badgeStyles.neutral,
  {
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
]);

export const tierBadgeFree = style([
  tierBadgeBase,
  {
    background: tokens.colors.gray100,
    color: tokens.colors.gray700,
  },
]);

export const tierBadgePro = style([
  tierBadgeBase,
  {
    background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.primaryHover} 100%)`,
    color: tokens.colors.white,
  },
]);

// Status Badges
const statusBadgeBase = style([
  badgeStyles.neutral,
  {
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
]);

export const statusBadgeActive = style([
  statusBadgeBase,
  {
    background: tokens.colors.successBg,
    color: tokens.colors.success,
  },
]);

export const statusBadgeCanceled = style([
  statusBadgeBase,
  {
    background: tokens.colors.errorBg,
    color: tokens.colors.error,
  },
]);

export const statusBadgePastDue = style([
  statusBadgeBase,
  {
    background: tokens.colors.warningBg,
    color: tokens.colors.warning,
  },
]);

// Subscription Content
export const subscriptionContent = style([utils.flexCol, utils.gap8]);

// Usage Section
export const usageSection = style([
  utils.cardSmall,
  {
    background: tokens.colors.gray50,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.space[6],
  },
]);

export const usageHeader = style([
  utils.flex,
  utils.gap2,
  {
    alignItems: "center",
    marginBottom: tokens.space[6],
  },
]);

globalStyle(`${usageHeader} h3`, {
  margin: 0,
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
});

export const usageGrid = style([
  utils.flexCol,
  utils.gap4,
  {
    marginBottom: tokens.space[6],
  },
]);

export const usageItem = style([utils.flexCol, utils.gap2]);

export const usageLabel = style([
  utils.flexBetween,
  {
    alignItems: "center",
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.gray700,
  },
]);

export const usageCount = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
});

export const usageCountAtLimit = style([
  usageCount,
  {
    color: tokens.colors.error,
  },
]);

export const usageBar = style({
  width: "100%",
  height: "8px",
  background: tokens.colors.border,
  borderRadius: tokens.borderRadius.base,
  overflow: "hidden",
});

export const usageBarUnlimited = style([
  usageBar,
  {
    background: `linear-gradient(90deg, ${tokens.colors.success} 0%, ${tokens.colors.successHover} 100%)`,
  },
]);

export const usageFill = style({
  height: "100%",
  background: `linear-gradient(90deg, ${tokens.colors.info} 0%, #2563eb 100%)`,
  borderRadius: tokens.borderRadius.base,
  transition: "width 0.3s ease",
});

export const usageFillAtLimit = style([
  usageFill,
  {
    background: `linear-gradient(90deg, ${tokens.colors.error} 0%, ${tokens.colors.errorHover} 100%)`,
  },
]);

export const usageFillUnlimited = style([
  usageFill,
  {
    background: `linear-gradient(90deg, ${tokens.colors.success} 0%, ${tokens.colors.successHover} 100%)`,
    width: "100% !important",
  },
]);

export const usageText = style([
  utils.textCenter,
  {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.success,
    fontWeight: tokens.fontWeight.semibold,
  },
]);

export const usageWarning = style([
  utils.textCenter,
  {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.error,
    fontWeight: tokens.fontWeight.semibold,
  },
]);

export const cronLimitInfo = style({
  background: tokens.colors.warningBg,
  border: `1px solid ${tokens.colors.warning}`,
  borderRadius: tokens.borderRadius.lg,
  padding: tokens.space[4],
});

globalStyle(`${cronLimitInfo} p`, {
  margin: 0,
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.warning,
});

globalStyle(`${cronLimitInfo} strong`, {
  color: tokens.colors.warning,
  fontWeight: tokens.fontWeight.bold,
});

// Pro Section
export const proSection = style([utils.flexCol, utils.gap8]);

export const proFeatures = style({
  background: `linear-gradient(135deg, ${tokens.colors.gray50} 0%, ${tokens.colors.gray200} 100%)`,
  border: `1px solid ${tokens.colors.gray300}`,
  borderRadius: tokens.borderRadius.xl,
  padding: tokens.space[6],
});

globalStyle(`${proFeatures} h3`, {
  margin: `0 0 ${tokens.space[4]} 0`,
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
});

export const subscriptionGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: tokens.space[4],
});

export const subscriptionItem = style([
  utils.flex,
  utils.gap3,
  {
    alignItems: "center",
    padding: tokens.space[3],
    background: tokens.colors.white,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.gray700,
  },
]);

export const subscriptionIcon = style([
  iconStyles.base,
  {
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.success,
  },
]);

// Billing Section
export const billingInfo = style({
  background: tokens.colors.gray50,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.xl,
  padding: tokens.space[6],
});

globalStyle(`${billingInfo} h3`, {
  margin: `0 0 ${tokens.space[4]} 0`,
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
});

export const billingDetails = style([utils.flexCol, utils.gap3]);

export const billingItem = style([
  utils.flexBetween,
  {
    alignItems: "center",
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: tokens.space[1],
      },
    },
  },
]);

export const billingLabel = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
  fontWeight: tokens.fontWeight.medium,
});

export const billingValue = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.text,
  fontWeight: tokens.fontWeight.semibold,
});

export const cancelNotice = style([
  billingValue,
  {
    color: tokens.colors.error,
  },
]);

// Actions Section
export const subscriptionActions = style({
  borderTop: `1px solid ${tokens.colors.border}`,
  paddingTop: tokens.space[8],
});

export const upgradeSection = style([
  utils.flexCol,
  utils.gap4,
  utils.textCenter,
  {
    alignItems: "center",
  },
]);

export const billingSection = style([utils.flexCol, utils.gap4]);

export const billingActions = style([
  utils.flexCol,
  utils.gap4,
  {
    alignItems: "center",
  },
]);

export const supportInfo = style([
  utils.textCenter,
  {
    padding: tokens.space[4],
    background: tokens.colors.gray50,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
  },
]);

globalStyle(`${supportInfo} p`, {
  margin: `0 0 ${tokens.space[2]} 0`,
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
});

// Buttons
export const upgradeBtn = style([
  buttonStyles.primary,
  utils.flex,
  utils.gap2,
  {
    padding: `${tokens.space[3]} ${tokens.space[8]}`,
    alignItems: "center",
    selectors: {
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 4px 12px ${tokens.colors.primaryLight}`,
      },
      "&:disabled": {
        opacity: 0.6,
        cursor: "not-allowed",
        transform: "none",
        boxShadow: "none",
      },
    },
  },
]);

export const manageBillingBtn = style([
  buttonStyles.outline,
  utils.flex,
  utils.gap2,
  {
    padding: `${tokens.space[3]} ${tokens.space[6]}`,
    alignItems: "center",
    background: tokens.colors.white,
    color: tokens.colors.gray700,
    border: `1px solid ${tokens.colors.gray300}`,
    selectors: {
      "&:hover": {
        borderColor: tokens.colors.gray400,
        background: tokens.colors.gray50,
      },
      "&:disabled": {
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
  },
]);

// Loading Spinner
export const loadingSubscriptionSpinner = style([
  utils.spinner,
  {
    width: tokens.space[4],
    height: tokens.space[4],
    animation: `${spin} 1s linear infinite`,
  },
]);

// Error Message
export const errorMessage = style([
  utils.flexBetween,
  {
    alignItems: "center",
    padding: `${tokens.space[3]} ${tokens.space[4]}`,
    background: tokens.colors.errorBg,
    border: `1px solid ${tokens.colors.error}`,
    borderRadius: tokens.borderRadius.lg,
    color: tokens.colors.error,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
  },
]);

export const errorDismiss = style({
  background: "none",
  border: "none",
  color: tokens.colors.error,
  cursor: "pointer",
  padding: tokens.space[1],
  borderRadius: tokens.borderRadius.base,
  fontSize: tokens.fontSize.base,
  selectors: {
    "&:hover": {
      background: tokens.colors.errorBg,
    },
  },
});
// Section Layout
export const section = utils.section;

export const sectionHeader = utils.sectionHeader;

export const sectionContent = utils.sectionContent;

globalStyle(`${sectionContent} h1`, {
  fontSize: tokens.fontSize["3xl"],
  fontWeight: tokens.fontWeight.bold,
  color: tokens.colors.text,
  margin: `0 0 ${tokens.space[2]} 0`,
});

globalStyle(`${sectionContent} p`, {
  color: tokens.colors.textMuted,
  margin: 0,
  lineHeight: tokens.lineHeight.normal,
});

export const errorText = style({
  color: tokens.colors.error,
  fontWeight: tokens.fontWeight.medium,
});

export const btnOutline = buttonStyles.outline;
