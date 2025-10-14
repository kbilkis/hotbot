import { style } from "@vanilla-extract/css";

// Container utility - used by various components
export const container = style({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 1rem",
});

// Screen reader only utility
export const srOnly = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

// Common loading spinner
export const loadingSpinner = style({
  width: "1rem",
  height: "1rem",
  border: "2px solid transparent",
  borderTop: "2px solid currentColor",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
});

// Visually hidden but accessible
export const visuallyHidden = style({
  position: "absolute",
  left: "-10000px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
});

// Focus trap for modals
export const focusTrap = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
});
