import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

export const hero = style({
  padding: `0 0 ${tokens.space[16]}`,
  position: "relative",
  background: "transparent",
});

export const heroContainer = style([
  utils.container,
  {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.space[16],
    alignItems: "center",
    position: "relative",
    "@media": {
      "(max-width: 768px)": {
        gridTemplateColumns: "1fr",
        gap: tokens.space[8],
        textAlign: "center",
      },
    },
  },
]);

export const heroContent = style([
  utils.textLeft,
  {
    "@media": {
      "(max-width: 768px)": {
        textAlign: "center",
      },
    },
  },
]);

export const heroTitle = style({
  fontSize: "3.5rem",
  fontWeight: tokens.fontWeight.bold,
  marginBottom: tokens.space[4],
  background: `linear-gradient(135deg, ${tokens.colors.text} 0%, ${tokens.colors.gray700} 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  lineHeight: tokens.lineHeight.tight,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "2.5rem",
    },
  },
});

export const heroDescription = style({
  fontSize: tokens.fontSize.xl,
  marginBottom: tokens.space[8],
  color: tokens.colors.textMuted,
  lineHeight: tokens.lineHeight.relaxed,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "1.1rem",
    },
  },
});

export const heroButtons = style([
  utils.flex,
  {
    gap: tokens.space[4],
    marginBottom: tokens.space[4],
    "@media": {
      "(max-width: 768px)": {
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      },
    },
  },
]);

export const ctaPrimary = style({
  background: tokens.colors.primary,
  color: tokens.colors.white,
  border: "none",
  padding: `${tokens.space[4]} ${tokens.space[8]}`,
  fontSize: "1.1rem",
  borderRadius: tokens.borderRadius.md,
  cursor: "pointer",
  fontWeight: tokens.fontWeight.semibold,
  transition: "all 0.2s ease",
  selectors: {
    "&:hover": {
      background: tokens.colors.primaryHover,
      transform: "translateY(-2px)",
    },
  },
  "@media": {
    "(max-width: 768px)": {
      width: "100%",
      maxWidth: "300px",
    },
  },
});

export const heroVisual = style([utils.flexCenter]);

export const heroSplit = style([
  utils.flexCol,
  {
    gap: tokens.space[8],
    "@media": {
      "(max-width: 768px)": {
        gap: tokens.space[4],
        alignItems: "center",
      },
    },
  },
]);

export const slackCaseImage = style({
  borderRadius: tokens.borderRadius.lg,
  overflow: "hidden",
  boxShadow: tokens.boxShadow.xl,
});

export const slackScreenshot = style({
  width: "100%",
  height: "auto",
  display: "block",
});

export const analyticsTiles = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: tokens.space[4],
});

export const statTile = style([
  utils.textCenter,
  {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.space[4],
    boxShadow: tokens.boxShadow.md,
  },
]);

export const statLabel = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.colors.textMuted,
  marginBottom: tokens.space[1],
  fontWeight: tokens.fontWeight.medium,
});

export const statValue = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.bold,
  color: tokens.colors.success,
});
