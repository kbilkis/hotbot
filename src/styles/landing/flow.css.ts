import { style, keyframes, globalStyle } from "@vanilla-extract/css";

import { tokens, utils } from "../theme/index.css";

// Animations
const float = keyframes({
  "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
  "33%": { transform: "translateY(-8px) rotate(2deg)" },
  "66%": { transform: "translateY(-12px) rotate(-1deg)" },
});

const wiggle = keyframes({
  "0%, 100%": { transform: "translateY(-50%) rotate(-2deg) scaleX(1)" },
  "25%": { transform: "translateY(-50%) rotate(1deg) scaleX(1.05)" },
  "50%": { transform: "translateY(-50%) rotate(-1deg) scaleX(0.95)" },
  "75%": { transform: "translateY(-50%) rotate(2deg) scaleX(1.02)" },
});

const bounce = keyframes({
  "0%, 100%": { transform: "translateY(-50%) rotate(5deg) scale(1)" },
  "50%": { transform: "translateY(-50%) rotate(-5deg) scale(1.1)" },
});

export const flowProviders = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: tokens.space[3],
  position: "relative",
});

export const providerIcon = style([
  utils.flexCenter,
  {
    width: "70px",
    height: "70px",
    borderRadius: tokens.borderRadius.lg,
    background: tokens.colors.white,
    border: `1px solid ${tokens.colors.border}`,
    boxShadow: tokens.boxShadow.sm,
    transition: "all 0.3s ease",
    position: "relative",
    selectors: {
      "&:nth-child(1)": {
        transform: "rotate(-8deg) translateX(-5px)",
        zIndex: 3,
      },
      "&:nth-child(2)": {
        transform: "rotate(12deg) translateX(8px)",
        zIndex: 2,
      },
      "&:nth-child(3)": {
        transform: "rotate(-5deg) translateX(-3px)",
        zIndex: 1,
      },
      "&:hover": {
        transform: "scale(1.15) rotate(25deg) translateY(-5px)",
        boxShadow: tokens.boxShadow.xl,
        zIndex: 10,
      },
    },
  },
]);

export const flowArrowContainer = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "60px",
  "@media": {
    "(max-width: 768px)": {
      transform: "rotate(90deg)",
      width: "60px",
      height: "120px",
    },
  },
});

export const fluidArrow = style({
  position: "relative",
  width: "100px",
  height: "40px",
  selectors: {
    // Curved arrow body with clip-path
    "&::before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "0",
      width: "70px",
      height: "6px",
      background: `linear-gradient(90deg, ${tokens.colors.primary}40, ${tokens.colors.primary}, ${tokens.colors.primaryHover})`,
      borderRadius: "3px",
      transform: "translateY(-50%)",
      clipPath: "polygon(0% 20%, 100% 0%, 100% 100%, 0% 80%)",
      animation: `${wiggle} 4s ease-in-out infinite`,
      boxShadow: `0 2px 8px ${tokens.colors.primary}30`,
    },
    // Proper CSS triangle arrow head
    "&::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      right: "8px",
      width: "0",
      height: "0",
      borderLeft: `16px solid ${tokens.colors.primary}`,
      borderTop: "10px solid transparent",
      borderBottom: "10px solid transparent",
      transform: "translateY(-50%)",
      animation: `${bounce} 2s ease-in-out infinite`,
      filter: `drop-shadow(2px 2px 4px ${tokens.colors.primary}30)`,
    },
  },
});

export const flowCenter = style([
  utils.flexCenter,
  {
    position: "relative",
  },
]);

export const hotbotLogo = style({
  width: "140px",
  height: "140px",
  animation: `${float} 3s ease-in-out infinite`,
});

globalStyle(`${providerIcon} img`, {
  width: "50px",
  height: "50px",
});
