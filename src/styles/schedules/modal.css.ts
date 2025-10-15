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
