import { style, keyframes } from "@vanilla-extract/css";

import { tokens } from "../theme/index.css";

const slideIn = keyframes({
  from: {
    transform: "translateX(100%)",
  },
  to: {
    transform: "translateX(0)",
  },
});

const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
});

export const hamburger = style({
  display: "none",
  flexDirection: "column",
  justifyContent: "space-around",
  width: tokens.space[6], // 24px
  height: tokens.space[6], // 24px
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
  zIndex: tokens.zIndex.dropdown,

  "@media": {
    "(max-width: 768px)": {
      display: "flex",
    },
  },
});

export const hamburgerLine = style({
  width: "100%",
  height: tokens.space[1], // 2px equivalent
  background: tokens.colors.text,
  borderRadius: tokens.borderRadius.sm,
  transition: "all 0.3s ease",
  transformOrigin: "center",
});

export const hamburgerLineOpen = style({
  selectors: {
    [`${hamburgerLine}:nth-child(1)&`]: {
      transform: "rotate(45deg) translate(5px, 5px)",
    },
    [`${hamburgerLine}:nth-child(2)&`]: {
      opacity: 0,
    },
    [`${hamburgerLine}:nth-child(3)&`]: {
      transform: "rotate(-45deg) translate(7px, -6px)",
    },
  },
});

export const overlay = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0.5)",
  zIndex: tokens.zIndex.modal,
  animation: `${fadeIn} 0.3s ease`,
});

export const mobileMenu = style({
  position: "fixed",
  top: 0,
  right: 0,
  height: "100vh",
  width: "280px",
  background: tokens.colors.white,
  boxShadow: tokens.boxShadow.xl,
  zIndex: tokens.zIndex.popover,
  animation: `${slideIn} 0.3s ease`,

  "@media": {
    "(max-width: 320px)": {
      width: "100vw",
    },
  },
});

export const mobileMenuContent = style({
  padding: `${tokens.space[16]} ${tokens.space[6]} ${tokens.space[6]}`,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  height: "100%",
  position: "relative",
});

export const closeButton = style({
  position: "absolute",
  top: tokens.space[4],
  right: tokens.space[4],
  width: tokens.space[10],
  height: tokens.space[10],
  background: "transparent",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: tokens.borderRadius.md,
  color: tokens.colors.textMuted,
  transition: "all 0.2s ease",

  selectors: {
    "&:hover": {
      background: tokens.colors.gray100,
      color: tokens.colors.text,
    },
  },
});

export const mobileNavLink = style({
  display: "block",
  padding: `${tokens.space[4]} 0`,
  color: tokens.colors.text,
  textDecoration: "none",
  fontSize: tokens.fontSize.lg,
  fontWeight: tokens.fontWeight.medium,
  borderBottom: `1px solid ${tokens.colors.border}`,
  transition: "color 0.2s ease",

  selectors: {
    "&:hover": {
      color: tokens.colors.primary,
    },
    "&:last-of-type": {
      borderBottom: "none",
    },
  },
});

export const mobileAuthSection = style({
  marginTop: "auto",
  paddingTop: tokens.space[6],
  borderTop: `1px solid ${tokens.colors.border}`,
});
