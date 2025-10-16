import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

export const modalOverlay = style([
  utils.flexCenter,
  {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: tokens.zIndex.modal,
    backdropFilter: "blur(4px)",
  },
]);

export const modalContent = style([
  utils.flexCol,
  {
    background: tokens.colors.white,
    borderRadius: tokens.borderRadius["2xl"],
    boxShadow: tokens.boxShadow["2xl"],
    maxWidth: "800px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "hidden",
  },
]);

export const modalHeader = style([
  utils.flexBetween,
  {
    alignItems: "center",
    padding: `${tokens.space[8]} ${tokens.space[8]} ${tokens.space[4]}`,
    borderBottom: `1px solid ${tokens.colors.border}`,
    flexShrink: 0,
  },
]);

export const modalTitleWithIcon = style([
  utils.flex,
  utils.gap3,
  {
    alignItems: "center",
  },
]);

export const scheduleIcon = style([
  utils.flexCenter,
  {
    background: tokens.colors.success,
    color: tokens.colors.white,
    width: "32px",
    height: "32px",
    borderRadius: tokens.borderRadius.lg,
    fontSize: tokens.fontSize.base,
  },
]);

export const modalTitle = style({
  fontSize: tokens.fontSize["2xl"],
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  margin: 0,
});

export const modalClose = style({
  background: "transparent",
  color: tokens.colors.textMuted,
  border: "none",
  borderRadius: tokens.borderRadius.base,
  cursor: "pointer",
  padding: tokens.space[1],
  fontSize: tokens.fontSize["2xl"],
  fontWeight: tokens.fontWeight.medium,
  transition: "all 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  outline: "none",
  selectors: {
    "&:hover": {
      background: tokens.colors.gray100,
    },
    "&:focus": {
      outline: `2px solid ${tokens.colors.primary}`,
      outlineOffset: "2px",
    },
  },
});

export const modalBody = style({
  padding: "1.5rem 2rem",
  overflowY: "auto",
  flex: 1,
});

export const modalFooter = style({
  padding: "1rem 2rem 2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "1rem",
  borderTop: "1px solid rgba(148, 163, 184, 0.1)",
  flexShrink: 0,
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
    },
  },
});
