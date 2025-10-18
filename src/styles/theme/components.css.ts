import { style, styleVariants } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

import { tokens } from "./tokens.css";
import { utils } from "./utils.css";

// Removed customButtonColors function - Vanilla Extract doesn't support function exports

// Button Recipe - Clean API for size + color variants
export const button = recipe({
  base: [
    utils.buttonBase,
    {
      fontWeight: tokens.fontWeight.medium,
      transition: "all 0.2s ease",
      textDecoration: "none", // Remove underline for links
      display: "inline-flex", // Override inline-block for proper flex behavior
      gap: "0.5rem", // Space between text and icons
    },
  ],

  variants: {
    // Color variants
    color: {
      primary: {
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
      discord: {
        background: "#5865f2",
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: "#4752c4",
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
            transform: "none",
          },
        },
      },
      slack: {
        background: "#4a154b",
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: "#611f69",
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
            transform: "none",
          },
        },
      },
      github: {
        background: "#001C4D",
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: "#0969da",
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
            transform: "none",
          },
        },
      },
      gitlab: {
        background: "#E24328",
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: "#FDA326",
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
            transform: "none",
          },
        },
      },
      bitbucket: {
        background: "#0052cc",
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: "#0747a6",
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
            transform: "none",
          },
        },
      },
      teams: {
        background: "#6264a7",
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: "#464775",
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
            transform: "none",
          },
        },
      },
      secondary: {
        background: tokens.colors.white,
        color: tokens.colors.black,
        border: `1px solid ${tokens.colors.success}`,
        selectors: {
          "&:hover": {
            background: tokens.colors.successHover,
            color: tokens.colors.white,
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
            transform: "none",
          },
        },
      },
      danger: {
        background: tokens.colors.error,
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: tokens.colors.errorHover,
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
          },
        },
      },
      outline: {
        background: "transparent",
        color: tokens.colors.primary,
        border: `1px solid ${tokens.colors.primary}`,
        selectors: {
          "&:hover": {
            background: tokens.colors.primaryLight,
          },
          "&:disabled": {
            background: "transparent",
            color: tokens.colors.gray400,
            borderColor: tokens.colors.gray400,
            cursor: "not-allowed",
          },
        },
      },
      ghost: {
        background: "transparent",
        color: tokens.colors.text,
        selectors: {
          "&:hover": {
            background: tokens.colors.gray100,
          },
          "&:disabled": {
            background: "transparent",
            color: tokens.colors.gray400,
            cursor: "not-allowed",
          },
        },
      },
      success: {
        background: tokens.colors.success,
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: tokens.colors.successHover,
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
            transform: "none",
          },
        },
      },
      info: {
        background: tokens.colors.info,
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: "#2563eb",
            transform: "translateY(-1px)",
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
            transform: "none",
          },
        },
      },
      warning: {
        background: tokens.colors.warning,
        color: tokens.colors.white,
        selectors: {
          "&:hover": {
            background: tokens.colors.warning,
            opacity: "0.8", // Warning uses opacity instead of darker color
          },
          "&:disabled": {
            background: tokens.colors.gray400,
            cursor: "not-allowed",
          },
        },
      },
    },

    // Size variants
    size: {
      xs: {
        padding: `${tokens.space[1]} ${tokens.space[3]}`,
        fontSize: tokens.fontSize.xs,
      },
      sm: {
        padding: `${tokens.space[2]} ${tokens.space[4]}`,
        fontSize: tokens.fontSize.sm,
      },
      md: {
        padding: `${tokens.space[3]} ${tokens.space[6]}`,
        fontSize: tokens.fontSize.base,
      },
      lg: {
        padding: `${tokens.space[4]} ${tokens.space[8]}`,
        fontSize: tokens.fontSize.lg,
        minHeight: "48px", // Better touch target for mobile
        "@media": {
          "(max-width: 768px)": {
            padding: `${tokens.space[4]} ${tokens.space[6]}`,
            fontSize: tokens.fontSize.base,
          },
        },
      },
      xl: {
        padding: `${tokens.space[5]} ${tokens.space[10]}`,
        fontSize: tokens.fontSize.xl,
      },
    },

    // Alternative variant for dashed border buttons
    alternative: {
      true: {
        border: `1px dashed ${tokens.colors.gray300}`,
        background: "transparent",
        color: tokens.colors.textMuted,
        selectors: {
          "&:hover": {
            borderColor: tokens.colors.primary,
            color: tokens.colors.primary,
          },
        },
      },
    },

    // Pill variant for fully rounded buttons
    pill: {
      true: {
        borderRadius: tokens.borderRadius.full,
      },
    },
  },

  // Default values
  defaultVariants: {
    color: "primary",
    size: "md",
  },

  // Special combinations for enhanced styling
  compoundVariants: [
    {
      variants: { color: "primary", size: "xl" },
      style: {
        boxShadow: `0 4px 12px ${tokens.colors.primary}40`,
      },
    },
    {
      variants: { color: "danger", size: "xl" },
      style: {
        boxShadow: `0 4px 12px ${tokens.colors.error}40`,
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
    width: tokens.fontSize.base, // 1rem - explicit width for SVGs
    height: tokens.fontSize.base, // 1rem - explicit height for SVGs
    fontSize: tokens.fontSize.sm, // 0.875rem - for icon fonts
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  base: {
    width: tokens.fontSize.lg, // 1.125rem - explicit width for SVGs
    height: tokens.fontSize.lg, // 1.125rem - explicit height for SVGs
    fontSize: tokens.fontSize.base, // 1rem - for icon fonts
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  lg: {
    width: tokens.fontSize.xl, // 1.25rem - explicit width for SVGs
    height: tokens.fontSize.xl, // 1.25rem - explicit height for SVGs
    fontSize: tokens.fontSize.lg, // 1.125rem - for icon fonts
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  xl: {
    width: tokens.fontSize["2xl"], // 1.5rem - explicit width for SVGs
    height: tokens.fontSize["2xl"], // 1.5rem - explicit height for SVGs
    fontSize: tokens.fontSize["3xl"], // 1.875rem - for icon fonts
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
