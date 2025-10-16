import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

export const beforeAfterChart = style([
  utils.textCenter,
  {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.space[8],
    marginTop: tokens.space[12],
  },
]);

export const chartTitle = style({
  fontSize: tokens.fontSize.xl,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  marginBottom: tokens.space[8],
});

export const chartContainer = style([
  utils.flex,
  {
    justifyContent: "center",
    alignItems: "end",
    gap: tokens.space[12],
    height: "120px",
  },
]);

export const chartBar = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",
});

export const barLabel = style({
  fontSize: "0.875rem",
  color: tokens.colors.textMuted,
  fontWeight: 500,
});

const bar = style({
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
