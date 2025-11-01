import { style } from "@vanilla-extract/css";

import { spin } from "../theme/animations.css";
import { tokens, utils, icon } from "../theme/index.css";

export const schedulesSection = style([utils.card]);

export const schedulesTable = style({
  width: "100%",
});

export const tableHeader = style({
  display: "grid",
  gridTemplateColumns: "0.75fr 1fr 1.5fr 2fr 1.25fr",
  gap: tokens.space[4],
  padding: `${tokens.space[3]} 0`,
  borderBottom: `1px solid ${tokens.colors.border}`,
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.textMuted,
  fontSize: tokens.fontSize.sm,
  "@media": {
    "(max-width: 1024px)": {
      gridTemplateColumns: "1fr 2fr 1.25fr",
      gap: tokens.space[2],
    },
  },
});

export const tableRow = style({
  display: "grid",
  gridTemplateColumns: "0.75fr 1fr 1.5fr 2fr 1.25fr",
  gap: tokens.space[4],
  padding: `${tokens.space[4]} 0`,
  borderBottom: `1px solid ${tokens.colors.borderLight}`,
  alignItems: "center",
  transition: "background-color 0.2s ease",
  selectors: {
    "&:hover": {
      background: tokens.colors.gray50,
    },
  },
  "@media": {
    "(max-width: 1024px)": {
      gridTemplateColumns: "1fr 2fr 1.25fr",
      gap: tokens.space[2],
    },
  },
});

export const statusCell = style([
  utils.flex,
  utils.gap2,
  {
    alignItems: "center",
  },
]);

const statusDot = style({
  width: "8px",
  height: "8px",
  borderRadius: tokens.borderRadius.full,
});

export const statusDotActive = style([
  statusDot,
  {
    backgroundColor: tokens.colors.success,
  },
]);

export const statusDotPaused = style([
  statusDot,
  {
    backgroundColor: tokens.colors.warning,
  },
]);

export const statusActive = style({
  color: tokens.colors.success,
  fontWeight: tokens.fontWeight.medium,
});

export const statusPaused = style({
  color: tokens.colors.warning,
  fontWeight: tokens.fontWeight.medium,
});

export const scheduleName = style({
  fontWeight: tokens.fontWeight.semibold,
  color: tokens.colors.text,
  marginBottom: tokens.space[1],
});

export const scheduleDetails = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.textMuted,
});

export const scheduleDescription = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.gray700,
});

export const scheduleUtc = style({
  fontSize: tokens.fontSize.xs,
  color: tokens.colors.textLight,
});

export const nextRunTime = style({
  fontSize: tokens.fontSize.sm,
  color: tokens.colors.gray700,
});

export const actionsCell = style([
  utils.flex,
  {
    justifyContent: "flex-end",
  },
]);

export const scheduleActions = style([utils.flex, utils.gap3]);

const actionButton = style([
  utils.flexCenter,
  {
    background: "none",
    border: "none",
    color: tokens.colors.textMuted,
    cursor: "pointer",
    padding: tokens.space[0],
    borderRadius: tokens.borderRadius.base,
    transition: "all 0.2s",
    minWidth: "36px",
    minHeight: "36px",
    selectors: {
      "&:hover": {
        background: tokens.colors.gray100,
        color: tokens.colors.gray700,
      },
    },
  },
]);

export const scheduleActionIcon = style([icon.base]);

export const editButton = style([
  actionButton,
  {
    selectors: {
      "&:hover": {
        background: tokens.colors.infoBg,
        color: tokens.colors.info,
      },
    },
  },
]);

export const testButton = style([
  actionButton,
  {
    selectors: {
      "&:hover": {
        background: tokens.colors.primaryLight,
        color: tokens.colors.primary,
      },
      "&:disabled": {
        cursor: "not-allowed",
        opacity: 0.5,
      },
      "&:disabled:hover": {
        background: "none",
        color: tokens.colors.textMuted,
      },
    },
  },
]);

export const toggleButton = style([
  actionButton,
  {
    selectors: {
      "&:hover": {
        background: tokens.colors.warningBg,
        color: tokens.colors.warning,
      },
      "&:disabled": {
        cursor: "not-allowed",
        opacity: 0.5,
      },
      "&:disabled:hover": {
        background: "none",
        color: tokens.colors.textMuted,
      },
    },
  },
]);

export const toggleButtonPaused = style([
  toggleButton,
  {
    color: tokens.colors.warning,
  },
]);

export const deleteButton = style([
  actionButton,
  {
    selectors: {
      "&:hover": {
        background: tokens.colors.errorBg,
        color: tokens.colors.error,
      },
    },
  },
]);

export const loadingSpinnerButton = style([
  utils.spinner,
  {
    width: "14px",
    height: "14px",
    border: `2px solid ${tokens.colors.border}`,
    borderTop: `2px solid ${tokens.colors.textMuted}`,
    animation: `${spin} 1s linear infinite`,
  },
]);

export const emptyState = style([
  utils.textCenter,
  {
    padding: `${tokens.space[12]} ${tokens.space[8]}`,
    color: tokens.colors.textMuted,
  },
]);

export const loadingSection = style([
  utils.textCenter,
  {
    padding: tokens.space[8],
    color: tokens.colors.textMuted,
  },
]);

export const errorMessage = style([
  utils.textCenter,
  {
    padding: tokens.space[8],
    color: tokens.colors.error,
    background: tokens.colors.errorBg,
    border: `1px solid ${tokens.colors.error}`,
    borderRadius: tokens.borderRadius.lg,
    margin: `${tokens.space[4]} 0`,
  },
]);
