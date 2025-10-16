import { style, globalStyle } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

// Value Proposition Section
export const valueProposition = style({
  padding: `${tokens.space[16]} 0`,
  background: "transparent",
  position: "relative",
});

export const valueTitle = style([
  utils.textCenter,
  {
    fontSize: "2.5rem",
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.space[4],
    color: tokens.colors.text,
  },
]);

export const valueSubtitle = style([
  utils.textCenter,
  {
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.textMuted,
    marginBottom: tokens.space[12],
    maxWidth: "600px",
    margin: `0 auto ${tokens.space[12]}`,
  },
]);

export const valueGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: tokens.space[8],
  marginBottom: tokens.space[12],
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const valueItem = style([
  utils.textCenter,
  {
    padding: tokens.space[8],
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    transition: "all 0.3s ease",
    selectors: {
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: tokens.boxShadow.xl,
      },
    },
  },
]);

export const valueIcon = style({
  fontSize: "3rem",
  marginBottom: tokens.space[4],
});

export const valueItemTitle = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  marginBottom: tokens.space[3],
});

export const valueItemDescription = style({
  fontSize: tokens.fontSize.base,
  color: tokens.colors.textMuted,
  lineHeight: tokens.lineHeight.relaxed,
  marginBottom: tokens.space[4],
});

export const valueItemBenefit = style([
  utils.flex,
  utils.flexCenter,
  {
    gap: tokens.space[2],
    padding: `${tokens.space[2]} ${tokens.space[4]}`,
    background: `linear-gradient(135deg, ${tokens.colors.success}15 0%, ${tokens.colors.success}25 100%)`,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.success,
    border: `1px solid ${tokens.colors.success}30`,
  },
]);

export const benefitIcon = style({
  fontSize: tokens.fontSize.base,
});

// Product Context Section
export const productContext = style({
  padding: `${tokens.space[16]} 0`,
  background: tokens.colors.background,
  backdropFilter: "blur(20px)",
  borderTop: `1px solid ${tokens.colors.border}`,
  borderBottom: `1px solid ${tokens.colors.border}`,
  position: "relative",
});

export const productContextTitle = style([
  utils.textCenter,
  {
    fontSize: "2rem",
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.space[12],
    color: tokens.colors.text,
  },
]);

export const contextGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: tokens.space[8],
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const contextCard = style({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
  padding: tokens.space[8],
  boxShadow: tokens.boxShadow.md,
  transition: "all 0.3s ease",
  selectors: {
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: tokens.boxShadow.xl,
    },
  },
});

export const contextHeader = style([
  utils.textCenter,
  {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.text,
    marginBottom: tokens.space[4],
  },
]);

// How It Works Section
export const howItWorks = style({
  padding: `${tokens.space[16]} 0 ${tokens.space[20]}`,
  position: "relative",
  background: "transparent",
});

export const howItWorksTitle = style([
  utils.textCenter,
  {
    fontSize: "2rem",
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.space[12],
    color: tokens.colors.text,
  },
]);

export const steps = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: tokens.space[8],
  marginBottom: tokens.space[12],
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const step = utils.textCenter;

export const stepNumber = style([
  utils.flexCenter,
  {
    width: "60px",
    height: "60px",
    border: `2px solid ${tokens.colors.primary}`,
    borderRadius: tokens.borderRadius.full,
    margin: `0 auto ${tokens.space[4]}`,
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.primary,
  },
]);

export const stepTitle = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.semibold,
  marginBottom: tokens.space[3],
  color: tokens.colors.text,
});

export const stepDescription = style({
  color: tokens.colors.textMuted,
  lineHeight: tokens.lineHeight.relaxed,
  fontSize: tokens.fontSize.sm,
});

// Demo and Flow Diagram Styles
export const integrationsDemoImage = style({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
  padding: tokens.space[6],
  margin: `${tokens.space[8]} 0`,
  boxShadow: tokens.boxShadow.md,
});

export const integrationsScreenshot = style({
  width: "100%",
  height: "auto",
  borderRadius: tokens.borderRadius.md,
});

export const flowDiagram = style([
  utils.flexCenter,
  {
    gap: tokens.space[12],
    margin: `${tokens.space[16]} 0`,
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
        gap: tokens.space[0],
      },
    },
  },
]);

export const flowArrow = style({
  fontSize: tokens.fontSize.xl,
  color: tokens.colors.textMuted,
  "@media": {
    "(max-width: 768px)": {
      transform: "rotate(90deg)",
    },
  },
});

export const flowLabel = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
  fontWeight: tokens.fontWeight.medium,
});

// CTA Repeat Section
export const ctaRepeat = style([
  utils.textCenter,
  {
    marginTop: tokens.space[12],
  },
]);

// Slack Digest Styles
export const slackDigestFull = style([
  utils.flexCol,
  {
    gap: tokens.space[4],
  },
]);

export const digestItem = style([
  utils.flex,
  {
    alignItems: "center",
    gap: tokens.space[4],
    padding: tokens.space[4],
    background: tokens.colors.background,
    borderRadius: tokens.borderRadius.md,
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
      },
    },
  },
]);

export const avatar = style([
  utils.flexCenter,
  {
    width: "40px",
    height: "40px",
    borderRadius: tokens.borderRadius.full,
    background: tokens.colors.primary,
    color: tokens.colors.white,
    fontWeight: tokens.fontWeight.semibold,
    fontSize: tokens.fontSize.sm,
  },
]);

export const details = style({
  flex: 1,
});

export const title = style({
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  marginBottom: tokens.space[1],
});

export const meta = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
});

export const actions = style([
  utils.flex,
  {
    gap: tokens.space[2],
  },
]);

globalStyle(`${actions} button`, {
  padding: `${tokens.space[2]} ${tokens.space[4]}`,
  border: `1px solid ${tokens.colors.border}`,
  background: tokens.colors.white,
  borderRadius: tokens.borderRadius.sm,
  fontSize: tokens.fontSize.sm,
  cursor: "pointer",
  transition: "all 0.2s ease",
});

globalStyle(`${actions} button:hover`, {
  borderColor: tokens.colors.primary,
  color: tokens.colors.primary,
});

// Escalation Example Styles
export const escalationExample = style({
  padding: tokens.space[4],
  background: tokens.colors.background,
  borderRadius: tokens.borderRadius.md,
});

export const escalationMessage = style([
  utils.flex,
  {
    gap: tokens.space[3],
    alignItems: "flex-start",
  },
]);

export const botIcon = style({
  fontSize: tokens.fontSize.xl,
});

export const messageContent = style({
  flex: 1,
});

export const messageText = style({
  fontWeight: tokens.fontWeight.medium,
  color: tokens.colors.text,
  marginBottom: tokens.space[1],
});

export const messageMentions = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
});

// Dashboard Preview Styles
export const dashboardPreview = style({
  padding: tokens.space[4],
  background: tokens.colors.background,
  borderRadius: tokens.borderRadius.md,
});

export const dashboardStat = utils.textCenter;

export const statNumber = style({
  fontSize: "2rem",
  fontWeight: tokens.fontWeight.bold,
  color: tokens.colors.text,
  marginBottom: tokens.space[2],
});

export const trend = style({
  fontSize: tokens.fontSize.base,
  color: tokens.colors.success,
});

export const statLabel = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
});

// Mini Sparkline Styles
export const miniSparkline = style([
  utils.flex,
  {
    alignItems: "end",
    gap: "2px",
    height: "30px",
    marginTop: tokens.space[4],
    justifyContent: "center",
  },
]);

export const sparklineBar = style({
  width: "4px",
  background: tokens.colors.success,
  borderRadius: "2px",
});
