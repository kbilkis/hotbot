import { style } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

export const integrations = style({
  padding: `${tokens.space[16]} 0`,
  background: "transparent",
  position: "relative",
});

export const integrationsTitle = style([
  utils.textCenter,
  {
    fontSize: "2rem",
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.space[12],
    color: tokens.colors.text,
  },
]);

export const integrationsGridLanding = style({
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: tokens.space[8],
  alignItems: "center",
  justifyItems: "center",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: tokens.space[4],
    },
  },
});

export const integrationItem = style([
  utils.flexCenter,
  {
    position: "relative",
    padding: tokens.space[6],
    borderRadius: tokens.borderRadius.lg,
    background: tokens.colors.white,
    border: `1px solid ${tokens.colors.border}`,
    boxShadow: tokens.boxShadow.sm,
    transition: "all 0.2s ease",
    width: "140px",
    height: "80px",
    selectors: {
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: tokens.boxShadow.md,
      },
    },
  },
]);

export const integrationLogo = style({
  height: "40px",
  width: "auto",
  maxWidth: "80px",
  objectFit: "contain",
  transition: "transform 0.2s ease",
});

export const comingSoonFlair = style({
  position: "absolute",
  top: "-8px",
  right: "-8px",
  background: tokens.colors.warning,
  color: tokens.colors.white,
  fontSize: "10px",
  fontWeight: tokens.fontWeight.semibold,
  padding: "2px 6px",
  borderRadius: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});
