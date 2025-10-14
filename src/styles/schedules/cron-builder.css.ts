import { style } from "@vanilla-extract/css";

export const cronBuilder = style({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

export const cronPresets = style({
  marginBottom: "1rem",
});

export const presetButtons = style({
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  marginTop: "0.5rem",
});

export const presetButton = style({
  padding: "0.5rem 1rem",
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    background: "#e5e7eb",
    borderColor: "#9ca3af",
  },
  ":active": {
    background: "#ff8000",
    borderColor: "#ff8000",
    color: "white",
  },
});

export const cronBuilderGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1rem",
  marginBottom: "1rem",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const cronField = style({
  display: "flex",
  flexDirection: "column",
});

export const cronLabel = style({
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.5rem",
});

export const cronSelect = style({
  padding: "0.5rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  background: "white",
  cursor: "pointer",
  transition: "all 0.2s",
  ":focus": {
    outline: "none",
    borderColor: "#ff8000",
    boxShadow: "0 0 0 3px rgba(255, 128, 0, 0.1)",
  },
});

export const cronExpression = style({
  marginTop: "1rem",
});

export const cronExpressionLabel = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
});

export const scheduleUtc = style({
  fontSize: "0.75rem",
  color: "#9ca3af",
  fontWeight: 400,
});

export const cronInput = style({
  width: "100%",
  padding: "0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  fontSize: "1rem",
  fontFamily: "monospace",
  background: "#f9fafb",
  transition: "all 0.2s",
  ":focus": {
    outline: "none",
    borderColor: "#ff8000",
    boxShadow: "0 0 0 3px rgba(255, 128, 0, 0.1)",
    background: "white",
  },
});

export const cronInputError = style([
  cronInput,
  {
    borderColor: "#ef4444",
    ":focus": {
      borderColor: "#ef4444",
      boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
    },
  },
]);

export const cronDescription = style({
  fontSize: "0.875rem",
  color: "#6b7280",
  marginTop: "0.5rem",
  fontStyle: "italic",
});

export const timezoneSection = style({
  marginBottom: "1rem",
});

export const timezoneLabel = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
});

export const timezoneSelect = style([
  cronSelect,
  {
    width: "100%",
  },
]);

export const fieldError = style({
  color: "#ef4444",
  fontSize: "0.875rem",
  marginTop: "0.25rem",
  fontWeight: 500,
});
