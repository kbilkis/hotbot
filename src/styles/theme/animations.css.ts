import { keyframes } from "@vanilla-extract/css";

// Common animation keyframes - centralized and reusable
export const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

export const fadeIn = keyframes({
  "0%": { opacity: 0, transform: "translateY(10px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

export const slideInFromRight = keyframes({
  "0%": { opacity: 0, transform: "translateX(20px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

export const slideInFromLeft = keyframes({
  "0%": { opacity: 0, transform: "translateX(-20px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

export const slideUp = keyframes({
  "0%": { opacity: 0, transform: "translateY(20px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

export const slideDown = keyframes({
  "0%": { opacity: 0, transform: "translateY(-20px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

export const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

export const bounce = keyframes({
  "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
  "40%, 43%": { transform: "translate3d(0, -30px, 0)" },
  "70%": { transform: "translate3d(0, -15px, 0)" },
  "90%": { transform: "translate3d(0, -4px, 0)" },
});

export const shake = keyframes({
  "0%, 100%": { transform: "translateX(0)" },
  "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-10px)" },
  "20%, 40%, 60%, 80%": { transform: "translateX(10px)" },
});

export const scale = keyframes({
  "0%": { transform: "scale(0.8)", opacity: 0 },
  "100%": { transform: "scale(1)", opacity: 1 },
});

export const rotate = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

// Utility animation classes using the keyframes
export const animations = {
  spin: `${spin} 1s linear infinite`,
  fadeIn: `${fadeIn} 0.3s ease-out`,
  slideInFromRight: `${slideInFromRight} 0.3s ease-out`,
  slideInFromLeft: `${slideInFromLeft} 0.3s ease-out`,
  slideUp: `${slideUp} 0.3s ease-out`,
  slideDown: `${slideDown} 0.3s ease-out`,
  pulse: `${pulse} 2s infinite`,
  bounce: `${bounce} 1s ease-in-out`,
  shake: `${shake} 0.5s ease-in-out`,
  scale: `${scale} 0.2s ease-out`,
  rotate: `${rotate} 2s linear infinite`,
};
