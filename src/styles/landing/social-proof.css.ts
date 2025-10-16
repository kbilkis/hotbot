import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

const baseLandingSection = style({
  position: "relative",
  zIndex: 1,
});

export const socialProof = style([
  baseLandingSection,
  {
    padding: `${tokens.space[12]} 0`,
    background: `linear-gradient(135deg, ${tokens.colors.background} 0%, rgba(99, 102, 241, 0.02) 100%)`,
    borderTop: `1px solid ${tokens.colors.border}`,
    borderBottom: `1px solid ${tokens.colors.border}`,
  },
]);

export const socialProofHeader = style([
  utils.textCenter,
  {
    marginBottom: tokens.space[8],
  },
]);

export const socialProofText = style({
  fontSize: tokens.fontSize.lg,
  color: tokens.colors.textMuted,
  fontWeight: tokens.fontWeight.medium,
});

export const testimonialGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: tokens.space[6],
  marginBottom: tokens.space[12],
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gap: tokens.space[4],
    },
  },
});

export const testimonialCard = style({
  background: tokens.colors.surface,
  border: `1px solid ${tokens.colors.border}`,
  borderRadius: tokens.borderRadius.lg,
  padding: tokens.space[6],
  boxShadow: tokens.boxShadow.sm,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  ":hover": {
    transform: "translateY(-2px)",
    boxShadow: tokens.boxShadow.md,
  },
});

export const testimonialContent = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[4],
});

export const testimonialQuote = style({
  fontSize: tokens.fontSize.lg,
  lineHeight: tokens.lineHeight.relaxed,
  color: tokens.colors.text,
  fontStyle: "italic",
  margin: 0,
});

export const testimonialAuthor = style([
  utils.flex,
  {
    alignItems: "center",
    gap: tokens.space[3],
  },
]);

export const authorAvatar = style([
  utils.flexCenter,
  {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    overflow: "hidden",
    border: `2px solid ${tokens.colors.border}`,
    background: tokens.colors.gray100,
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.primary,
  },
]);

export const authorInfo = style([utils.flexCol]);

export const authorName = style({
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
});

export const authorTitle = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
});

export const statsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: tokens.space[6],
  marginBottom: tokens.space[12],
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: tokens.space[4],
    },
  },
});

export const statItem = style([
  utils.textCenter,
  {
    padding: tokens.space[4],
  },
]);

export const statNumber = style({
  fontSize: "2.5rem",
  fontWeight: tokens.fontWeight.bold,
  color: tokens.colors.primary,
  marginBottom: tokens.space[1],
});

export const statLabel = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
  fontWeight: tokens.fontWeight.medium,
});

export const securityBadges = style([
  utils.flex,
  utils.flexCenter,
  {
    gap: tokens.space[6],
    flexWrap: "wrap",
    "@media": {
      "(max-width: 768px)": {
        gap: tokens.space[4],
      },
    },
  },
]);

export const securityBadge = style([
  utils.flex,
  {
    alignItems: "center",
    gap: tokens.space[2],
    padding: `${tokens.space[2]} ${tokens.space[4]}`,
    background: tokens.colors.surface,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.text,
  },
]);

export const badgeIcon = style({
  fontSize: tokens.fontSize.base,
});
