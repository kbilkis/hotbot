import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

const baseLandingSection = style({
  position: "relative",
  zIndex: 1,
});

export const comparison = style([
  baseLandingSection,
  {
    padding: `${tokens.space[16]} 0`,
    background: tokens.colors.background,
  },
]);

export const comparisonTitle = style([
  utils.textCenter,
  {
    fontSize: "2.5rem",
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.space[4],
    color: tokens.colors.text,
  },
]);

export const comparisonSubtitle = style([
  utils.textCenter,
  {
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.textMuted,
    marginBottom: tokens.space[12],
    maxWidth: "600px",
    margin: `0 auto ${tokens.space[12]}`,
  },
]);

export const comparisonTable = style({
  background: tokens.colors.surface,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
  overflow: "hidden",
  boxShadow: tokens.boxShadow.lg,
  marginBottom: tokens.space[12],
  "@media": {
    "(max-width: 768px)": {
      display: "none", // Hide table on mobile
    },
  },
});

export const comparisonHeader = style({
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  background: tokens.colors.gray50,
  borderBottom: `2px solid ${tokens.colors.border}`,
  "@media": {
    "(max-width: 1024px)": {
      gridTemplateColumns: "2fr 1fr 1fr",
    },
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gap: tokens.space[2],
    },
  },
});

export const featureColumn = style({
  padding: tokens.space[4],
  fontWeight: tokens.fontWeight.semibold,
  fontSize: tokens.fontSize.lg,
  color: tokens.colors.text,
});

export const solutionColumn = style([
  utils.textCenter,
  {
    padding: tokens.space[4],
    borderLeft: `1px solid ${tokens.colors.border}`,
    "@media": {
      "(max-width: 768px)": {
        borderLeft: "none",
        borderTop: `1px solid ${tokens.colors.border}`,
      },
    },
  },
]);

export const hotbotColumn = style([
  solutionColumn,
  {
    background: `linear-gradient(135deg, ${tokens.colors.primaryLight} 0%, rgba(255, 128, 0, 0.05) 100%)`,
    position: "relative",
    "::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: tokens.colors.primary,
    },
  },
]);

export const solutionName = style({
  fontWeight: tokens.fontWeight.semibold,
  fontSize: tokens.fontSize.base,
  marginBottom: tokens.space[1],
  color: tokens.colors.text,
});

export const solutionBadge = style({
  background: tokens.colors.primary,
  color: "white",
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: tokens.borderRadius.full,
  fontSize: tokens.fontSize.xs,
  fontWeight: tokens.fontWeight.medium,
});

export const solutionType = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
});

export const comparisonRow = style({
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  borderBottom: `1px solid ${tokens.colors.border}`,
  ":last-child": {
    borderBottom: "none",
  },
  "@media": {
    "(max-width: 1024px)": {
      gridTemplateColumns: "2fr 1fr 1fr",
    },
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const featureCell = style({
  padding: tokens.space[4],
  borderRight: `1px solid ${tokens.colors.border}`,
  "@media": {
    "(max-width: 768px)": {
      borderRight: "none",
      borderBottom: `1px solid ${tokens.colors.border}`,
    },
  },
});

export const solutionCell = style([
  utils.textCenter,
  utils.flexCol,
  {
    padding: tokens.space[4],
    borderRight: `1px solid ${tokens.colors.border}`,
    gap: tokens.space[1],
    alignItems: "center",
    justifyContent: "center",
    ":last-child": {
      borderRight: "none",
    },
    "@media": {
      "(max-width: 768px)": {
        borderRight: "none",
        borderBottom: `1px solid ${tokens.colors.border}`,
        ":last-child": {
          borderBottom: "none",
        },
      },
    },
  },
]);

export const hotbotCell = style([
  solutionCell,
  {
    background: `linear-gradient(135deg, ${tokens.colors.primaryLight} 0%, rgba(255, 128, 0, 0.05) 100%)`,
  },
]);

export const checkmark = style({
  fontSize: tokens.fontSize.lg,
  color: tokens.colors.success,
});

export const cross = style({
  fontSize: tokens.fontSize.lg,
  color: tokens.colors.error,
});

export const partial = style({
  fontSize: tokens.fontSize.lg,
  color: tokens.colors.warning,
});

export const comparisonCTA = style([
  utils.textCenter,
  {
    background: `linear-gradient(135deg, ${tokens.colors.surface} 0%, rgba(99, 102, 241, 0.05) 100%)`,
    padding: tokens.space[8],
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border}`,
  },
]);

export const ctaTitle = style({
  fontSize: "2rem",
  fontWeight: tokens.fontWeight.bold,
  marginBottom: tokens.space[4],
  color: tokens.colors.text,
});

export const ctaDescription = style({
  fontSize: tokens.fontSize.lg,
  color: tokens.colors.textMuted,
  marginBottom: tokens.space[6],
  maxWidth: "500px",
  margin: `0 auto ${tokens.space[6]}`,
});

// Mobile-specific comparison cards
export const mobileComparison = style({
  display: "none",
  "@media": {
    "(max-width: 768px)": {
      display: "block",
    },
  },
});

export const mobileComparisonCards = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[6],
  marginBottom: tokens.space[12],
});

export const mobileComparisonCard = style({
  background: tokens.colors.surface,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
  padding: tokens.space[6],
  boxShadow: tokens.boxShadow.sm,
});

export const mobileCardHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: tokens.space[4],
  paddingBottom: tokens.space[4],
  borderBottom: `1px solid ${tokens.colors.border}`,
});

export const mobileCardTitle = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
});

export const mobileCardBadge = style({
  background: tokens.colors.primary,
  color: "white",
  padding: `${tokens.space[1]} ${tokens.space[3]}`,
  borderRadius: tokens.borderRadius.full,
  fontSize: tokens.fontSize.xs,
  fontWeight: tokens.fontWeight.medium,
});

export const mobileFeatureComparison = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[4],
});

export const mobileFeatureRow = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: tokens.space[3],
  background: tokens.colors.gray50,
  borderRadius: tokens.borderRadius.md,
});

export const mobileFeatureName = style({
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.text,
  flex: 1,
});

export const mobileFeatureResults = style({
  display: "flex",
  gap: tokens.space[4],
  alignItems: "center",
});

export const mobileFeatureResult = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: tokens.space[1],
  minWidth: "60px",
});

export const mobileFeatureIcon = style({
  fontSize: tokens.fontSize.lg,
});

export const mobileFeatureLabel = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.colors.textMuted,
  textAlign: "center",
});
