import { style, styleVariants } from "@vanilla-extract/css";

import { tokens } from "./tokens.css";
import { utils } from "./utils.css";

// Button component styles
export const button = styleVariants({
  primary: [
    utils.buttonBase,
    {
      padding: `${tokens.space[3]} ${tokens.space[6]}`,
      background: tokens.colors.primary,
      color: tokens.colors.white,
      selectors: {
        "&:hover": {
          background: tokens.colors.primaryHover,
          transform: "translateY(-1px)",
        },
        "&:disabled": {
          background: tokens.colors.gray400,
          cursor: "not-allowed",
          transform: "none",
        },
      },
    },
  ],

  secondary: [
    utils.buttonBase,
    {
      padding: `${tokens.space[3]} ${tokens.space[6]}`,
      background: tokens.colors.gray500,
      color: tokens.colors.white,
      selectors: {
        "&:hover": {
          background: tokens.colors.gray600,
        },
        "&:disabled": {
          background: tokens.colors.gray400,
          cursor: "not-allowed",
        },
      },
    },
  ],

  danger: [
    utils.buttonBase,
    {
      padding: `${tokens.space[3]} ${tokens.space[6]}`,
      background: tokens.colors.error,
      color: tokens.colors.white,
      selectors: {
        "&:hover": {
          background: tokens.colors.errorHover,
        },
      },
    },
  ],

  outline: [
    utils.buttonBase,
    {
      padding: `${tokens.space[2]} ${tokens.space[4]}`,
      background: "transparent",
      color: tokens.colors.primary,
      border: `1px solid ${tokens.colors.primary}`,
      selectors: {
        "&:hover": {
          background: tokens.colors.primaryLight,
        },
      },
    },
  ],

  ghost: [
    utils.buttonBase,
    {
      padding: `${tokens.space[2]} ${tokens.space[4]}`,
      background: "transparent",
      color: tokens.colors.text,
      selectors: {
        "&:hover": {
          background: tokens.colors.gray100,
        },
      },
    },
  ],
});

// Input component styles
export const input = styleVariants({
  default: [
    utils.inputBase,
    {
      width: "100%",
    },
  ],

  error: [
    utils.inputBase,
    {
      width: "100%",
      borderColor: tokens.colors.error,
      selectors: {
        "&:focus": {
          borderColor: tokens.colors.error,
          boxShadow: `0 0 0 3px rgba(239, 68, 68, 0.1)`,
        },
      },
    },
  ],

  monospace: [
    utils.inputBase,
    {
      width: "100%",
      fontFamily: "monospace",
      background: tokens.colors.gray50,
    },
  ],
});

// Badge component styles
export const badge = styleVariants({
  success: [utils.badge, utils.statusSuccess],

  error: [utils.badge, utils.statusError],

  warning: [utils.badge, utils.statusWarning],

  info: [utils.badge, utils.statusInfo],

  neutral: [
    utils.badge,
    {
      color: tokens.colors.gray700,
      backgroundColor: tokens.colors.gray100,
    },
  ],
});

// Typography styles
export const typography = styleVariants({
  h1: {
    fontSize: tokens.fontSize["4xl"],
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.text,
    lineHeight: tokens.lineHeight.tight,
    margin: `0 0 ${tokens.space[4]} 0`,
  },

  h2: {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.text,
    lineHeight: tokens.lineHeight.tight,
    margin: `0 0 ${tokens.space[3]} 0`,
  },

  h3: {
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.text,
    lineHeight: tokens.lineHeight.tight,
    margin: `0 0 ${tokens.space[2]} 0`,
  },

  body: {
    fontSize: tokens.fontSize.base,
    color: tokens.colors.text,
    lineHeight: tokens.lineHeight.normal,
    margin: `0 0 ${tokens.space[4]} 0`,
  },

  bodyMuted: {
    fontSize: tokens.fontSize.base,
    color: tokens.colors.textMuted,
    lineHeight: tokens.lineHeight.normal,
    margin: `0 0 ${tokens.space[4]} 0`,
  },

  small: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    lineHeight: tokens.lineHeight.normal,
  },

  caption: {
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textLight,
    lineHeight: tokens.lineHeight.normal,
  },
});

// Icon styles
export const icon = styleVariants({
  sm: {
    fontSize: tokens.fontSize.sm,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  base: {
    fontSize: tokens.fontSize.base,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  lg: {
    fontSize: tokens.fontSize.lg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  xl: {
    fontSize: tokens.fontSize["3xl"],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  success: {
    fontSize: tokens.fontSize["3xl"],
    color: tokens.colors.success,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  error: {
    fontSize: tokens.fontSize["3xl"],
    color: tokens.colors.error,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

// Loading states
export const loading = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.base,
  fontWeight: tokens.fontWeight.medium,
});

// Alert/notification styles
export const alert = styleVariants({
  success: {
    padding: tokens.space[4],
    background: tokens.colors.successBg,
    border: `1px solid ${tokens.colors.success}`,
    borderRadius: tokens.borderRadius.lg,
    color: tokens.colors.success,
  },

  error: {
    padding: tokens.space[4],
    background: tokens.colors.errorBg,
    border: `1px solid ${tokens.colors.error}`,
    borderRadius: tokens.borderRadius.lg,
    color: tokens.colors.error,
  },

  warning: {
    padding: tokens.space[4],
    background: tokens.colors.warningBg,
    border: `1px solid ${tokens.colors.warning}`,
    borderRadius: tokens.borderRadius.lg,
    color: tokens.colors.warning,
  },

  info: {
    padding: tokens.space[4],
    background: tokens.colors.infoBg,
    border: `1px solid ${tokens.colors.info}`,
    borderRadius: tokens.borderRadius.lg,
    color: tokens.colors.info,
  },
});
