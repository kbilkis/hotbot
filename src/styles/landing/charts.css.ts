import { style } from "@vanilla-extract/css";

export const beforeAfterChart = style({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "1rem",
  padding: "2rem",
  marginTop: "3rem",
  textAlign: "center",
});

export const chartTitle = style({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "2rem",
});

export const chartContainer = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "end",
  gap: "3rem",
  height: "120px",
});

export const chartBar = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",
});

export const barLabel = style({
  fontSize: "0.875rem",
  color: "#6b7280",
  fontWeight: 500,
});

export const bar = style({
  width: "60px",
  backgroundColor: "#e5e7eb",
  borderRadius: "4px 4px 0 0",
  transition: "all 0.3s ease",
});

export const barBefore = style([
  bar,
  {
    backgroundColor: "#ef4444",
  },
]);

export const barAfter = style([
  bar,
  {
    backgroundColor: "#10b981",
  },
]);

export const barValue = style({
  fontSize: "1rem",
  fontWeight: 600,
  color: "#111827",
});
