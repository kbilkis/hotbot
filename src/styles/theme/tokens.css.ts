import { createGlobalTheme } from "@vanilla-extract/css";

// Design tokens - the single source of truth
export const tokens = createGlobalTheme(":root", {
  // Colors
  colors: {
    // Primary brand colors
    primary: "#ff8000",
    primaryHover: "#cc5500",
    primaryLight: "rgba(255, 128, 0, 0.1)",

    // Semantic colors
    success: "#10b981",
    successHover: "#059669",
    error: "#ef4444",
    errorHover: "#dc2626",
    warning: "#fbbf24",
    info: "#3b82f6",

    // Neutral colors
    white: "#ffffff",
    black: "#000000",

    // Gray scale
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#374151",
    gray800: "#1f2937",
    gray900: "#111827",

    // Background colors
    background: "#f3f4f6",
    surface: "#ffffff",
    surfaceHover: "#f8fafc",

    // Text colors
    text: "#1f2937",
    textMuted: "#6b7280",
    textLight: "#9ca3af",

    // Border colors
    border: "#e5e7eb",
    borderLight: "#f3f4f6",
    borderFocus: "#ff8000",

    // Status backgrounds
    successBg: "#f0fdf4",
    errorBg: "#fef2f2",
    warningBg: "#fef3c7",
    infoBg: "#eff6ff",
  },

  // Spacing scale
  space: {
    "0": "0",
    "1": "0.25rem", // 4px
    "2": "0.5rem", // 8px
    "3": "0.75rem", // 12px
    "4": "1rem", // 16px
    "5": "1.25rem", // 20px
    "6": "1.5rem", // 24px
    "8": "2rem", // 32px
    "10": "2.5rem", // 40px
    "12": "3rem", // 48px
    "16": "4rem", // 64px
    "20": "5rem", // 80px
  },

  // Font sizes
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },

  // Font weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // Border radius
  borderRadius: {
    none: "0",
    sm: "0.125rem", // 2px
    base: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    full: "9999px",
  },

  // Shadows
  boxShadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },

  // Line heights
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.625",
  },

  // Z-index scale
  zIndex: {
    dropdown: "1000",
    sticky: "1020",
    fixed: "1030",
    modal: "1040",
    popover: "1050",
    tooltip: "1060",
  },
});
