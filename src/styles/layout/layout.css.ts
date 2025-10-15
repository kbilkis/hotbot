import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

export const appLayout = style([
  utils.flexCol,
  {
    minHeight: "100vh",
  },
]);

export const header = style({
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(20px)",
  borderBottom: `1px solid ${tokens.colors.border}`,
  padding: `${tokens.space[4]} 0`,
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: tokens.zIndex.fixed,
});

export const nav = style([
  utils.flexBetween,
  utils.container,
  {
    alignItems: "center",
  },
]);

export const logo = style([
  utils.flex,
  {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.primary,
    alignItems: "center",
  },
]);

export const logoLink = utils.flex;

export const logoImage = style({
  height: "40px",
  width: "auto",
  objectFit: "contain",
  transition: "transform 0.2s ease",
  selectors: {
    "&:hover": {
      transform: "scale(1.15)",
    },
  },
});

export const navLinks = style([
  utils.flex,
  utils.gap6,
  {
    alignItems: "center",
    "@media": {
      "(max-width: 768px)": {
        gap: tokens.space[4],
      },
    },
  },
]);

export const navLink = style({
  color: tokens.colors.textMuted,
  textDecoration: "none",
  fontWeight: tokens.fontWeight.medium,
  transition: "color 0.2s",
  selectors: {
    "&:hover": {
      color: tokens.colors.primary,
    },
  },
});

export const main = style({
  paddingTop: "120px",
  flex: 1,
});

export const footer = style([
  utils.textCenter,
  {
    background: "rgba(249, 250, 251, 0.8)",
    backdropFilter: "blur(20px)",
    borderTop: `1px solid ${tokens.colors.border}`,
    color: tokens.colors.textMuted,
    padding: `${tokens.space[12]} 0`,
    marginTop: "auto",
    position: "relative",
    zIndex: 2,
  },
]);

export const footerContainer = utils.container;
// Dashboard Layout
export const dashboard = style({
  minHeight: "calc(100vh - 80px)",
  paddingTop: "80px", // Account for fixed header
  background: "transparent",
});

export const dashboardContainer = style([
  utils.container,
  {
    padding: `${tokens.space[8]} ${tokens.space[4]}`,
  },
]);
