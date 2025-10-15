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
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: tokens.space[4],
    },
  },
});

export const integrationItem = style([
  utils.flexCenter,
  {
    position: "relative",
    padding: tokens.space[4],
    borderRadius: tokens.borderRadius.md,
    transition: "transform 0.2s ease",
    selectors: {
      "&:hover": {
        transform: "scale(1.05)",
      },
    },
  },
]);

export const integrationLogo = style({
  height: "40px",
  width: "auto",
  objectFit: "contain",
  filter: "grayscale(100%)",
  transition: "filter 0.3s ease",
  selectors: {
    "&:hover": {
      filter: "grayscale(0%)",
    },
  },
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
