import { globalStyle } from "@vanilla-extract/css";

import { tokens } from "../theme/tokens.css";

// Modern CSS Reset - Based on Josh Comeau's CSS Reset + Normalize.css
// https://www.joshwcomeau.com/css/custom-css-reset/

// 1. Use a more-intuitive box-sizing model
globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

// 2. Remove default margin and padding
globalStyle("*", {
  margin: 0,
  padding: 0,
});

// 3. Prevent mobile font size inflation
globalStyle("html", {
  WebkitTextSizeAdjust: "100%",
  MozTextSizeAdjust: "100%",
  textSizeAdjust: "100%",
});

// 4. Improve text rendering
globalStyle("body", {
  lineHeight: 1.5,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  textRendering: "optimizeSpeed",
  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif`,
  color: tokens.colors.text,
  background: tokens.colors.background,
  overflowX: "hidden",
});

// 5. Improve media defaults
globalStyle("img, picture, video, canvas, svg", {
  display: "block",
  maxWidth: "100%",
  height: "auto",
});

// 6. Remove built-in form typography styles
globalStyle("input, button, textarea, select", {
  font: "inherit",
  color: "inherit",
});

// 7. Avoid text overflows
globalStyle("p, h1, h2, h3, h4, h5, h6", {
  overflowWrap: "break-word",
  hyphens: "auto",
});

// 8. Create a root stacking context
globalStyle("#root, #__next", {
  isolation: "isolate",
});

// 9. Remove list styles
globalStyle("ul, ol", {
  listStyle: "none",
});

// 10. Remove default button styles
globalStyle("button", {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
});

// 11. Remove default link styles
globalStyle("a", {
  color: "inherit",
  textDecoration: "none",
});

// 12. Improve table defaults
globalStyle("table", {
  borderCollapse: "collapse",
  borderSpacing: 0,
});

// 13. Remove default fieldset styles
globalStyle("fieldset", {
  border: "none",
  padding: 0,
  margin: 0,
});

// 14. Remove default legend styles
globalStyle("legend", {
  padding: 0,
});

// 15. Improve form element consistency
globalStyle("input, textarea, select, button", {
  borderRadius: 0,
  outline: "none",
});

// 16. Remove default search input styles
globalStyle('input[type="search"]', {
  WebkitAppearance: "none",
  appearance: "none",
});

// 17. Remove default number input spinners
globalStyle('input[type="number"]::-webkit-outer-spin-button', {
  WebkitAppearance: "none",
  margin: 0,
});

globalStyle('input[type="number"]::-webkit-inner-spin-button', {
  WebkitAppearance: "none",
  margin: 0,
});

globalStyle('input[type="number"]', {
  MozAppearance: "textfield",
});

// 18. Accessibility - Focus styles
globalStyle(
  "button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible, a:focus-visible",
  {
    outline: `2px solid ${tokens.colors.primary}`,
    outlineOffset: "2px",
    borderRadius: "2px",
  }
);

// 19. Remove focus outline for mouse users (but keep for keyboard)
globalStyle(
  "button:focus:not(:focus-visible), input:focus:not(:focus-visible), textarea:focus:not(:focus-visible), select:focus:not(:focus-visible), a:focus:not(:focus-visible)",
  {
    outline: "none",
  }
);

// 20. Improve readability for reduced motion users
globalStyle("*", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animationDuration: "0.01ms",
      animationIterationCount: 1,
      transitionDuration: "0.01ms",
    },
  },
});

globalStyle("html", {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      scrollBehavior: "auto",
    },
  },
});

// 21. Dark mode support preparation
globalStyle(":root", {
  "@media": {
    "(prefers-color-scheme: dark)": {
      colorScheme: "dark",
    },
  },
});

// Global responsive typography (mobile-first approach)
globalStyle("h1", {
  fontSize: tokens.fontSize["2xl"], // Mobile default
  fontWeight: tokens.fontWeight.bold,
  lineHeight: tokens.lineHeight.tight,
  "@media": {
    "(min-width: 768px)": {
      fontSize: tokens.fontSize["4xl"], // Desktop
    },
  },
});

globalStyle("h2", {
  fontSize: tokens.fontSize.xl, // Mobile default
  fontWeight: tokens.fontWeight.semibold,
  lineHeight: tokens.lineHeight.tight,
  "@media": {
    "(min-width: 768px)": {
      fontSize: tokens.fontSize["3xl"], // Desktop
    },
  },
});

globalStyle("h3", {
  fontSize: tokens.fontSize.lg, // Mobile default
  fontWeight: tokens.fontWeight.semibold,
  lineHeight: tokens.lineHeight.tight,
  "@media": {
    "(min-width: 768px)": {
      fontSize: tokens.fontSize["2xl"], // Desktop
    },
  },
});

globalStyle("h4", {
  fontSize: tokens.fontSize.base, // Mobile default
  fontWeight: tokens.fontWeight.semibold,
  lineHeight: tokens.lineHeight.normal,
  "@media": {
    "(min-width: 768px)": {
      fontSize: tokens.fontSize.xl, // Desktop
    },
  },
});

globalStyle("h5", {
  fontSize: tokens.fontSize.sm, // Mobile default
  fontWeight: tokens.fontWeight.semibold,
  lineHeight: tokens.lineHeight.normal,
  "@media": {
    "(min-width: 768px)": {
      fontSize: tokens.fontSize.lg, // Desktop
    },
  },
});

globalStyle("h6", {
  fontSize: tokens.fontSize.xs, // Mobile default
  fontWeight: tokens.fontWeight.semibold,
  lineHeight: tokens.lineHeight.normal,
  "@media": {
    "(min-width: 768px)": {
      fontSize: tokens.fontSize.base, // Desktop
    },
  },
});

globalStyle("p", {
  fontSize: tokens.fontSize.sm, // Mobile default
  lineHeight: tokens.lineHeight.normal,
  "@media": {
    "(min-width: 768px)": {
      fontSize: tokens.fontSize.base, // Desktop
    },
  },
});

// CSS Custom Properties are now handled by tokens.css.ts using createGlobalTheme
// This provides better type safety and integration with vanilla-extract

// Keyframes moved to src/styles/theme/animations.css.ts for better organization
