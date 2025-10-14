import { style, keyframes } from "@vanilla-extract/css";

const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

export const schedulesSection = style({
  background: "#ffffff",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "1rem",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  margin: "0 2rem",
  "@media": {
    "(max-width: 768px)": {
      margin: "0 1rem",
    },
  },
});

export const createScheduleButton = style({
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
    transform: "translateY(-1px)",
  },
});

export const schedulesTable = style({
  width: "100%",
});

export const tableHeader = style({
  display: "grid",
  gridTemplateColumns: "0.75fr 1fr 1.5fr 2fr 0.75fr",
  gap: "1rem",
  padding: "0.75rem 0",
  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
  fontWeight: 600,
  color: "#6b7280",
  fontSize: "0.875rem",
  "@media": {
    "(max-width: 1024px)": {
      gridTemplateColumns: "1fr 2fr 1fr",
      gap: "0.5rem",
    },
  },
});

export const tableRow = style({
  display: "grid",
  gridTemplateColumns: "0.75fr 1fr 1.5fr 2fr 0.75fr",
  gap: "1rem",
  padding: "1rem 0",
  borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
  alignItems: "center",
  transition: "background-color 0.2s ease",
  ":hover": {
    background: "#f8fafc",
  },
  "@media": {
    "(max-width: 1024px)": {
      gridTemplateColumns: "1fr 2fr 1fr",
      gap: "0.5rem",
    },
  },
});

export const statusCell = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

export const statusDot = style({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
});

export const statusDotActive = style([
  statusDot,
  {
    backgroundColor: "#10b981",
  },
]);

export const statusDotPaused = style([
  statusDot,
  {
    backgroundColor: "#f59e0b",
  },
]);

export const statusActive = style({
  color: "#10b981",
  fontWeight: 500,
});

export const statusPaused = style({
  color: "#f59e0b",
  fontWeight: 500,
});

export const scheduleName = style({
  fontWeight: 600,
  color: "#111827",
  marginBottom: "0.25rem",
});

export const scheduleDetails = style({
  fontSize: "0.875rem",
  color: "#6b7280",
});

export const scheduleDescription = style({
  fontSize: "0.875rem",
  color: "#374151",
});

export const scheduleUtc = style({
  fontSize: "0.75rem",
  color: "#9ca3af",
});

export const nextRunTime = style({
  fontSize: "0.875rem",
  color: "#374151",
});

export const actionsCell = style({
  display: "flex",
  justifyContent: "flex-end",
});

export const scheduleActions = style({
  display: "flex",
  gap: "0.5rem",
});

export const actionButton = style({
  background: "none",
  border: "none",
  color: "#6b7280",
  cursor: "pointer",
  padding: "0.5rem",
  borderRadius: "0.25rem",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ":hover": {
    background: "rgba(107, 114, 128, 0.1)",
    color: "#374151",
  },
});

export const scheduleActionIcon = style({
  width: "1rem",
  height: "1rem",
});

export const editButton = style([actionButton]);

export const toggleButton = style([
  actionButton,
  {
    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
]);

export const toggleButtonPaused = style([
  toggleButton,
  {
    color: "#f59e0b",
  },
]);

export const deleteButton = style([
  actionButton,
  {
    ":hover": {
      background: "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
    },
  },
]);

export const loadingSpinnerButton = style({
  width: "14px",
  height: "14px",
  border: "2px solid #e5e7eb",
  borderTop: "2px solid #6b7280",
  borderRadius: "50%",
  animation: `${spin} 1s linear infinite`,
});

export const emptyState = style({
  textAlign: "center",
  padding: "3rem 2rem",
  color: "#6b7280",
});

export const loadingSection = style({
  textAlign: "center",
  padding: "2rem",
  color: "#6b7280",
});

export const errorMessage = style({
  textAlign: "center",
  padding: "2rem",
  color: "#ef4444",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "0.5rem",
  margin: "1rem 0",
});

export const retryButton = style({
  marginLeft: "0.5rem",
  padding: "0.25rem 0.5rem",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "0.25rem",
  fontSize: "0.75rem",
  cursor: "pointer",
  transition: "background 0.2s",
  ":hover": {
    background: "#dc2626",
  },
  ":disabled": {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
});
