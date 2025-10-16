import { style, globalStyle } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

import { fadeIn } from "../theme/animations.css";
import { tokens, utils } from "../theme/index.css";

// =============================================================================
// APP LAYOUT (Header, Nav, Footer)
// =============================================================================

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

// =============================================================================
// PAGE LAYOUTS (Simplified single page layout)
// =============================================================================

// Single page layout - all pages use the same basic structure
export const page = style({
  minHeight: "calc(100vh - 80px)", // Account for header
  position: "relative",
});

// Landing page mouse tracking effect (applied separately)
export const landingPageEffect = style({});

globalStyle(`${landingPageEffect}::before`, {
  content: '""',
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: `
    linear-gradient(rgba(209, 213, 219, 0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(209, 213, 219, 0.4) 1px, transparent 1px),
    radial-gradient(
      300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(255, 128, 0, 0.08) 0%,
      rgba(255, 128, 0, 0.04) 30%,
      rgba(156, 163, 175, 0.02) 50%,
      transparent 70%
    )
  `,
  backgroundColor: tokens.colors.gray50,
  backgroundSize: "50px 50px, 50px 50px, 100% 100%",
  pointerEvents: "none",
  transition: "all 0.3s ease",
});

// Content card - for fullscreen centered content blocks (auth, upgrade pages)
export const contentCard = recipe({
  base: [
    utils.card,
    utils.textCenter,
    {
      width: "100%",
      animation: `${fadeIn} 0.5s ease-out`,
      // Fullscreen centered layout
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(135deg, ${tokens.colors.gray50} 0%, ${tokens.colors.gray200} 100%)`,
      padding: tokens.space[8],
      zIndex: tokens.zIndex.modal,
      // Responsive padding
      "@media": {
        "(max-width: 768px)": {
          padding: tokens.space[4],
        },
      },
    },
  ],

  variants: {
    size: {
      default: {
        maxWidth: "500px",
      },
      medium: {
        maxWidth: "600px",
      },
      fullPage: {
        maxWidth: "none",
      },
    },
  },

  defaultVariants: {
    size: "default",
  },
});

// =============================================================================
// SECTION LAYOUTS (for dashboard sections)
// =============================================================================

export const section = style({
  marginBottom: tokens.space[12],
});

export const sectionHeader = style([
  utils.flexBetween,
  {
    alignItems: "flex-start",
    padding: `0 ${tokens.space[8]}`,
    marginBottom: tokens.space[6],
    "@media": {
      "(max-width: 768px)": {
        flexDirection: "column",
        gap: tokens.space[4],
        alignItems: "stretch",
      },
    },
  },
]);

export const sectionContent = style([
  utils.flexCol,
  {
    alignItems: "start",
  },
]);

export const sectionTitle = style({
  fontSize: tokens.fontSize["2xl"],
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  marginBottom: tokens.space[1],
  lineHeight: tokens.lineHeight.tight,
});

export const sectionDescription = style({
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.sm,
  lineHeight: tokens.lineHeight.normal,
  margin: 0,
});

export const integrationsGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: tokens.space[8],
  padding: `0 ${tokens.space[8]}`,
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
      padding: `0 ${tokens.space[4]}`,
    },
  },
});
