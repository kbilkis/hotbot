import { style, globalStyle } from "@vanilla-extract/css";

// Landing page base styles
export const landingPage = style({
  minHeight: "100vh",
  paddingTop: "2rem",
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
    linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
    radial-gradient(
      300px circle at var(--mouse-x) var(--mouse-y),
      rgba(255, 128, 0, 0.08) 0%,
      rgba(255, 128, 0, 0.04) 30%,
      rgba(156, 163, 175, 0.02) 50%,
      transparent 70%
    )
  `,
  backgroundSize: "50px 50px, 50px 50px, 100% 100%",
  pointerEvents: "none",
  zIndex: 1,
  transition: "all 0.3s ease",
});

// Container utility
export const container = style({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 1rem",
});
