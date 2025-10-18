import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

export const hero = style({
  padding: `0 0 ${tokens.space[16]}`,
  position: "relative",
  background: "transparent",
  "@media": {
    "(max-width: 768px)": {
      padding: `${tokens.space[4]} 0 ${tokens.space[12]}`,
    },
  },
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
        gap: tokens.space[6],
        textAlign: "center",
        padding: `0 ${tokens.space[4]}`,
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
      fontSize: "2rem",
      lineHeight: "1.2",
    },
    "(max-width: 480px)": {
      fontSize: "1.75rem",
    },
  },
});

export const heroSubtitle = style({
  fontSize: tokens.fontSize.xl,
  marginBottom: tokens.space[6],
  color: tokens.colors.text,
  lineHeight: tokens.lineHeight.relaxed,
  fontWeight: tokens.fontWeight.medium,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "1.1rem",
      marginBottom: tokens.space[8],
      lineHeight: "1.5",
    },
  },
});

export const heroDescription = style({
  fontSize: tokens.fontSize.lg,
  marginBottom: tokens.space[6],
  color: tokens.colors.textMuted,
  lineHeight: tokens.lineHeight.relaxed,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "1rem",
    },
  },
});

export const trustIcon = style({
  fontSize: tokens.fontSize.base,
});

export const heroButtons = style([
  utils.flex,
  {
    flexWrap: "wrap",
    gap: tokens.space[4],
    marginBottom: tokens.space[6],
    "@media": {
      "(max-width: 768px)": {
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "stretch",
        gap: tokens.space[4],
        marginBottom: tokens.space[8],
      },
    },
  },
]);

export const secondaryButton = style({
  textDecoration: "none",
});

export const heroGuarantee = style([
  utils.flex,
  {
    alignItems: "center",
    gap: tokens.space[2],
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    fontWeight: tokens.fontWeight.medium,
    "@media": {
      "(max-width: 768px)": {
        justifyContent: "center",
        flexWrap: "wrap",
        textAlign: "center",
        marginBottom: tokens.space[6],
      },
    },
  },
]);

export const guaranteeIcon = style({
  color: tokens.colors.success,
  fontSize: tokens.fontSize.base,
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
  "@media": {
    "(max-width: 768px)": {
      maxWidth: "100%",
      margin: "0 auto",
    },
  },
});

export const slackScreenshot = style({
  width: "100%",
  height: "auto",
  display: "block",
  // Ensure proper aspect ratio is maintained
  aspectRatio: "1972 / 1182",
  "@media": {
    "(max-width: 768px)": {
      aspectRatio: "563 / 1019",
    },
  },
});

export const analyticsTiles = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: tokens.space[4],
  "@media": {
    "(max-width: 768px)": {
      gap: tokens.space[2],
      maxWidth: "300px",
      margin: "0 auto",
    },
  },
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
    "@media": {
      "(max-width: 768px)": {
        padding: tokens.space[3],
      },
    },
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
