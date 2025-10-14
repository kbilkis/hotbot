import { globalStyle, keyframes } from "@vanilla-extract/css";

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
  color: "#1f2937",
  background: "#f3f4f6",
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
    outline: "2px solid #ff8000",
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

// 22. CSS Custom Properties for theming
globalStyle(":root", {
  vars: {
    "--font-family-sans": `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`,
    "--font-family-mono": `"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Consolas", monospace`,
    "--color-primary": "#ff8000",
    "--color-primary-hover": "#cc5500",
    "--color-text": "#1f2937",
    "--color-text-muted": "#6b7280",
    "--color-background": "#f3f4f6",
    "--color-surface": "#ffffff",
    "--border-radius": "0.5rem",
    "--shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "--shadow-md":
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "--shadow-lg":
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "--transition-fast": "0.15s ease-out",
    "--transition-normal": "0.2s ease-out",
    "--transition-slow": "0.3s ease-out",
  },
});

// 23. Utility keyframes
export const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

export const fadeIn = keyframes({
  "0%": { opacity: 0, transform: "translateY(10px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

export const slideInFromRight = keyframes({
  "0%": { opacity: 0, transform: "translateX(20px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

export const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});
