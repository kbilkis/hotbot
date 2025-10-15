import { style } from "@vanilla-extract/css";

// Form Groups and Inputs
export const formGroup = style({
  marginBottom: "1.5rem",
});

export const formLabel = style({
  display: "block",
  fontWeight: 500,
  color: "#111827",
  marginBottom: "0.5rem",
});

export const formInput = style({
  width: "100%",
  padding: "0.75rem",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "0.5rem",
  fontSize: "1rem",
  transition: "all 0.2s",
  background: "white",
  ":focus": {
    outline: "none",
    borderColor: "#ff8000",
    boxShadow: "0 0 0 3px rgba(255, 128, 0, 0.1)",
  },
});

export const formInputError = style([
  formInput,
  {
    borderColor: "#ef4444",
    ":focus": {
      borderColor: "#ef4444",
      boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
    },
  },
]);

export const formSelect = style([
  formInput,
  {
    cursor: "pointer",
  },
]);

export const formHelp = style({
  display: "block",
  color: "#6b7280",
  fontSize: "0.875rem",
  marginTop: "0.25rem",
  lineHeight: 1.4,
});

export const fieldError = style({
  color: "#ef4444",
  fontSize: "0.875rem",
  marginTop: "0.25rem",
  fontWeight: 500,
});

// Form Sections
export const formSection = style({
  marginBottom: "2rem",
});

export const formSectionTitle = style({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "1rem",
});

export const formRow = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const loadingText = style({
  color: "#6b7280",
  fontSize: "0.875rem",
  fontStyle: "italic",
  padding: "0.5rem",
  textAlign: "center",
});

// Repository and Channel Selection
export const repositorySelection = style({
  border: "1px solid #e5e7eb",
  borderRadius: "0.5rem",
  padding: "1rem",
  background: "#f8fafc",
});

export const channelSelection = style({
  border: "1px solid #e5e7eb",
  borderRadius: "0.5rem",
  padding: "1rem",
  background: "#f8fafc",
});

export const checkboxGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  maxHeight: "200px",
  overflowY: "auto",
  padding: "0.5rem",
  border: "1px solid #e5e7eb",
  borderRadius: "0.375rem",
  background: "white",
});

export const checkboxLabel = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.25rem",
  cursor: "pointer",
  fontSize: "0.875rem",
  ":hover": {
    background: "#f3f4f6",
    borderRadius: "0.25rem",
  },
});

export const noRepositories = style({
  color: "#9ca3af",
  fontSize: "0.875rem",
  fontStyle: "italic",
  textAlign: "center",
  padding: "1rem",
});

export const selectProviderFirst = style({
  color: "#9ca3af",
  fontSize: "0.875rem",
  fontStyle: "italic",
  textAlign: "center",
  padding: "1rem",
});

export const noChannels = style({
  color: "#9ca3af",
  fontSize: "0.875rem",
  fontStyle: "italic",
  textAlign: "center",
  padding: "1rem",
});

// Discord-specific styles
export const discordSelection = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});
