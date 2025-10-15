import { style, globalStyle } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

// Landing page base styles
export const landingPage = style({
  minHeight: "100vh",
  paddingTop: tokens.space[8],
  position: "relative",
});

// Global mouse tracking effect
globalStyle(`${landingPage}::before`, {
  content: '""',
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: `
    linear-gradient(${tokens.colors.gray300}1a 1px, transparent 1px),
    linear-gradient(90deg, ${tokens.colors.gray300}1a 1px, transparent 1px),
    radial-gradient(
      300px circle at var(--mouse-x) var(--mouse-y),
      ${tokens.colors.primary}14 0%,
      ${tokens.colors.primary}0a 30%,
      ${tokens.colors.gray400}05 50%,
      transparent 70%
    )
  `,
  backgroundSize: "50px 50px, 50px 50px, 100% 100%",
  pointerEvents: "none",
  zIndex: tokens.zIndex.dropdown,
  transition: "all 0.3s ease",
});

// Container utility
export const container = utils.container;
