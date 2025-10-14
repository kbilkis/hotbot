import { style } from "@vanilla-extract/css";

export const filterBuilder = style({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
});

export const filterSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const filterInputGroup = style({
  display: "flex",
  gap: "0.5rem",
  alignItems: "flex-start",
});

export const filterInput = style({
  flex: 1,
  padding: "0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  transition: "all 0.2s",
  ":focus": {
    outline: "none",
    borderColor: "#ff8000",
    boxShadow: "0 0 0 3px rgba(255, 128, 0, 0.1)",
  },
});

export const addFilterButton = style({
  padding: "0.75rem 1rem",
  background: "#10b981",
  color: "white",
  border: "none",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  whiteSpace: "nowrap",
  ":hover": {
    background: "#059669",
  },
  ":disabled": {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
});

export const commonFilters = style({
  marginTop: "0.5rem",
});

export const commonFiltersLabel = style({
  fontSize: "0.75rem",
  color: "#6b7280",
  marginBottom: "0.5rem",
  display: "block",
});

export const commonFilterButtons = style({
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
});

export const commonFilterButton = style({
  padding: "0.25rem 0.75rem",
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  borderRadius: "1rem",
  fontSize: "0.75rem",
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    background: "#e5e7eb",
    borderColor: "#9ca3af",
  },
  ":disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

export const filterItems = style({
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  marginTop: "0.75rem",
});

export const filterItem = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "1rem",
  fontSize: "0.875rem",
  color: "#1e40af",
});

export const removeTag = style({
  background: "none",
  border: "none",
  color: "#6b7280",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "bold",
  padding: "0",
  marginLeft: "0.25rem",
  transition: "color 0.2s",
  ":hover": {
    color: "#ef4444",
  },
});

export const filterPreview = style({
  marginTop: "1.5rem",
  padding: "1rem",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
});

export const filterPreviewTitle = style({
  fontSize: "1rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "0.5rem",
});

export const filterPreviewText = style({
  fontSize: "0.875rem",
  color: "#6b7280",
  lineHeight: 1.5,
});

export const filterPreviewCode = style({
  fontFamily: "monospace",
  background: "#f1f5f9",
  padding: "0.125rem 0.25rem",
  borderRadius: "0.25rem",
  fontSize: "0.8125rem",
});
export const filterLabel = style({
  display: "block",
  fontWeight: 500,
  color: "#111827",
  marginBottom: "0.5rem",
});

export const filterHelp = style({
  color: "#6b7280",
  fontSize: "0.875rem",
  marginBottom: "0.75rem",
  lineHeight: 1.4,
});
