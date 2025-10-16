import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

export const pricing = style({
  padding: `${tokens.space[20]} 0`,
  position: "relative",
  background: "transparent",
});

export const pricingTitle = style([
  utils.textCenter,
  {
    fontSize: "3rem",
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.space[4],
    color: tokens.colors.text,
    "@media": {
      "(max-width: 768px)": {
        fontSize: "2rem",
      },
    },
  },
]);

export const pricingGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: tokens.space[8],
  maxWidth: "1100px",
  margin: `${tokens.space[16]} auto 0`,
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const pricingCard = style([
  utils.textCenter,
  {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    border: `1px solid ${tokens.colors.border}`,
    padding: tokens.space[4],
    borderRadius: tokens.borderRadius.lg,
    position: "relative",
    transition: "all 0.3s ease",
    overflow: "hidden",
    boxShadow: tokens.boxShadow.md,
    selectors: {
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: tokens.boxShadow.xl,
      },
    },
  },
]);

export const pricingCardFeatured = style([
  pricingCard,
  {
    borderColor: `${tokens.colors.primary}66`, // 40% opacity
    transform: "scale(1.05)",
    boxShadow: `0 25px 50px ${tokens.colors.primary}26`, // 15% opacity
    "@media": {
      "(max-width: 768px)": {
        transform: "none",
      },
    },
  },
]);

export const popularBadge = style({
  position: "absolute",
  top: "-12px",
  left: "50%",
  transform: "translateX(-50%)",
  background: tokens.colors.primary,
  color: tokens.colors.white,
  padding: `${tokens.space[2]} ${tokens.space[4]}`,
  borderRadius: tokens.borderRadius.lg,
  fontSize: tokens.fontSize.sm,
  fontWeight: tokens.fontWeight.semibold,
});

export const pricingCardTitle = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.semibold,
  marginBottom: tokens.space[4],
  color: tokens.colors.text,
});

export const pricingCardTitleFeatured = style([
  pricingCardTitle,
  {
    marginTop: "20px",
  },
]);

export const price = style({
  fontSize: "3rem",
  fontWeight: tokens.fontWeight.bold,
  color: tokens.colors.primary,
  marginBottom: tokens.space[2],
});

export const priceUnit = style({
  fontSize: tokens.fontSize.base,
  color: tokens.colors.textMuted,
});

export const pricingDescription = style({
  color: tokens.colors.textMuted,
  marginBottom: tokens.space[8],
});

export const featuresList = style({
  listStyle: "none",
  marginBottom: tokens.space[8],
  textAlign: "left",
  padding: 0,
});

export const featuresListItem = style({
  color: tokens.colors.gray700,
  marginBottom: tokens.space[2],
  paddingLeft: tokens.space[4],
});
