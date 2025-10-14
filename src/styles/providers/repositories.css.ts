import { style } from "@vanilla-extract/css";

// Repository Management
export const repositoriesSection = style({
  marginTop: "0.5rem",
});

export const repositoriesLoading = style({
  padding: "1rem",
  textAlign: "center",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  color: "#64748b",
  fontSize: "0.875rem",
});

export const repositoriesError = style({
  padding: "1rem",
  textAlign: "center",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "0.5rem",
  color: "#dc2626",
  fontSize: "0.875rem",
});

export const repositoriesEmpty = style({
  padding: "1rem",
  textAlign: "center",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  color: "#64748b",
  fontSize: "0.875rem",
});

export const retryButton = style({
  marginLeft: "0.5rem",
  padding: "0.25rem 0.5rem",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "0.25rem",
  fontSize: "0.75rem",
  cursor: "pointer",
  transition: "background 0.2s",
  ":hover": {
    background: "#b91c1c",
  },
  ":disabled": {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
});

export const repositoriesList = style({
  marginTop: "1rem",
});

export const repositoriesCount = style({
  fontSize: "0.875rem",
  color: "#64748b",
  marginBottom: "0.75rem",
});

export const repositoriesContainer = style({
  maxHeight: "300px",
  overflowY: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: "0.5rem",
  padding: "0.5rem",
});

export const repositoryItem = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem",
  borderRadius: "0.25rem",
  transition: "background 0.2s",
  ":hover": {
    background: "#f3f4f6",
  },
});

export const repoIcon = style({
  fontSize: "1rem",
  color: "#6b7280",
});

export const repoName = style({
  fontSize: "0.875rem",
  color: "#374151",
  fontFamily: "monospace",
});

export const showMoreButton = style({
  width: "100%",
  padding: "0.5rem",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.25rem",
  color: "#6b7280",
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "all 0.2s",
  marginTop: "0.5rem",
  ":hover": {
    background: "#f1f5f9",
    color: "#374151",
  },
});

export const showLessButton = style([
  showMoreButton,
  {
    background: "#fff7ed",
    borderColor: "#fed7aa",
    color: "#ea580c",
    ":hover": {
      background: "#ffedd5",
      color: "#c2410c",
    },
  },
]);
