import { style } from "@vanilla-extract/css";

export const modalOverlay = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(4px)",
});

export const modalContent = style({
  background: "white",
  borderRadius: "1rem",
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
  maxWidth: "800px",
  width: "90%",
  maxHeight: "90vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const modalHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "2rem 2rem 1rem",
  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
  flexShrink: 0,
});

export const modalTitleWithIcon = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
});

export const scheduleIcon = style({
  background: "#10b981",
  color: "white",
  width: "32px",
  height: "32px",
  borderRadius: "0.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
});

export const modalTitle = style({
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#111827",
  margin: 0,
});

export const modalClose = style({
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  color: "#6b7280",
  cursor: "pointer",
  padding: "0.25rem",
  borderRadius: "0.25rem",
  transition: "all 0.2s",
  ":hover": {
    background: "rgba(107, 114, 128, 0.1)",
  },
});

export const modalBody = style({
  padding: "1.5rem 2rem",
  overflowY: "auto",
  flex: 1,
});

export const modalDescription = style({
  color: "#6b7280",
  marginBottom: "2rem",
  lineHeight: 1.6,
});

export const modalFooter = style({
  padding: "1rem 2rem 2rem",
  display: "flex",
  justifyContent: "flex-end",
  gap: "1rem",
  borderTop: "1px solid rgba(148, 163, 184, 0.1)",
  flexShrink: 0,
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
    },
  },
});

export const saveButton = style({
  background: "#ff8000",
  color: "white",
  border: "none",
  padding: "0.75rem 1.5rem",
  borderRadius: "0.5rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    background: "#cc5500",
  },
  ":disabled": {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
});

export const cancelButton = style({
  background: "transparent",
  color: "#6b7280",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  padding: "0.75rem 1.5rem",
  borderRadius: "0.5rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    borderColor: "#ff8000",
    color: "#ff8000",
  },
});

// Schedule-specific form sections
export const scheduleFormSection = style({
  marginBottom: "2rem",
  padding: "1.5rem",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.75rem",
});

export const scheduleFormSectionTitle = style({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

export const scheduleFormSectionIcon = style({
  fontSize: "1.25rem",
});

export const repositoryList = style({
  maxHeight: "200px",
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

export const repositoryCheckbox = style({
  marginRight: "0.5rem",
});

export const repositoryName = style({
  fontSize: "0.875rem",
  color: "#374151",
});

export const channelSelect = style({
  width: "100%",
  padding: "0.75rem",
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

export const escalationSettings = style({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "1rem",
  alignItems: "end",
});

export const escalationDaysInput = style({
  width: "80px",
  padding: "0.5rem",
  border: "1px solid #d1d5db",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  textAlign: "center",
  ":focus": {
    outline: "none",
    borderColor: "#ff8000",
    boxShadow: "0 0 0 3px rgba(255, 128, 0, 0.1)",
  },
});
