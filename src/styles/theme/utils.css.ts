import { style } from "@vanilla-extract/css";

import { tokens } from "./tokens.css";

// Common utility styles using design tokens
export const utils = {
  // Layout utilities
  container: style({
    maxWidth: "1200px",
    margin: "0 auto",
    padding: `0 ${tokens.space[4]}`,
  }),

  // Flexbox utilities
  flex: style({
    display: "flex",
  }),

  flexCol: style({
    display: "flex",
    flexDirection: "column",
  }),

  flexCenter: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),

  flexBetween: style({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),

  // Spacing utilities
  gap1: style({ gap: tokens.space[1] }),
  gap2: style({ gap: tokens.space[2] }),
  gap3: style({ gap: tokens.space[3] }),
  gap4: style({ gap: tokens.space[4] }),
  gap6: style({ gap: tokens.space[6] }),
  gap8: style({ gap: tokens.space[8] }),

  // Text utilities
  textCenter: style({ textAlign: "center" }),
  textLeft: style({ textAlign: "left" }),
  textRight: style({ textAlign: "right" }),

  // Screen reader only
  srOnly: style({
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  }),

  // Loading spinner
  spinner: style({
    width: tokens.space[4],
    height: tokens.space[4],
    border: `2px solid transparent`,
    borderTop: `2px solid currentColor`,
    borderRadius: tokens.borderRadius.full,
    animation: "spin 1s linear infinite",
  }),

  // Card styles
  card: style({
    background: tokens.colors.surface,
    borderRadius: tokens.borderRadius["2xl"],
    boxShadow: tokens.boxShadow.md,
    padding: tokens.space[8],
  }),

  cardSmall: style({
    background: tokens.colors.surface,
    borderRadius: tokens.borderRadius.lg,
    boxShadow: tokens.boxShadow.sm,
    padding: tokens.space[4],
  }),

  // Section styles
  section: style({
    background: tokens.colors.surface,
    borderRadius: tokens.borderRadius["2xl"],
    boxShadow: tokens.boxShadow.sm,
    overflow: "hidden",
  }),

  sectionHeader: style({
    padding: `${tokens.space[8]} ${tokens.space[8]} ${tokens.space[4]}`,
    borderBottom: `1px solid ${tokens.colors.border}`,
  }),

  sectionContent: style({
    padding: tokens.space[8],
  }),

  // Button base styles
  buttonBase: style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.borderRadius.lg,
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.semibold,
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    textDecoration: "none",
  }),

  // Input base styles
  inputBase: style({
    padding: `${tokens.space[3]} ${tokens.space[4]}`,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.fontSize.base,
    background: tokens.colors.surface,
    transition: "all 0.2s ease",
    selectors: {
      "&:focus": {
        outline: "none",
        borderColor: tokens.colors.borderFocus,
        boxShadow: `0 0 0 3px ${tokens.colors.primaryLight}`,
      },
    },
  }),

  // Badge styles
  badge: style({
    display: "inline-flex",
    alignItems: "center",
    padding: `${tokens.space[1]} ${tokens.space[3]}`,
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.semibold,
  }),

  // Status styles
  statusSuccess: style({
    color: tokens.colors.success,
    backgroundColor: tokens.colors.successBg,
  }),

  statusError: style({
    color: tokens.colors.error,
    backgroundColor: tokens.colors.errorBg,
  }),

  statusWarning: style({
    color: tokens.colors.warning,
    backgroundColor: tokens.colors.warningBg,
  }),

  statusInfo: style({
    color: tokens.colors.info,
    backgroundColor: tokens.colors.infoBg,
  }),
};
