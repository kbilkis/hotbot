import { style } from "@vanilla-extract/css";

export const hero = style({
  padding: "0rem 0 4rem",
  position: "relative",
  background: "transparent",
  zIndex: 2,
});

export const heroContainer = style({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 1rem",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "4rem",
  alignItems: "center",
  position: "relative",
  zIndex: 2,
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gap: "2rem",
      textAlign: "center",
    },
  },
});

export const heroContent = style({
  textAlign: "left",
  "@media": {
    "(max-width: 768px)": {
      textAlign: "center",
    },
  },
});

export const heroTitle = style({
  fontSize: "3.5rem",
  fontWeight: 800,
  marginBottom: "1rem",
  background: "linear-gradient(135deg, #111827 0%, #374151 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  lineHeight: 1.1,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "2.5rem",
    },
  },
});

export const heroDescription = style({
  fontSize: "1.25rem",
  marginBottom: "2rem",
  color: "#6b7280",
  lineHeight: 1.6,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "1.1rem",
    },
  },
});

export const heroButtons = style({
  display: "flex",
  gap: "1rem",
  marginBottom: "1rem",
  "@media": {
    "(max-width: 768px)": {
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center",
    },
  },
});

export const ctaPrimary = style({
  background: "#ff8000",
  color: "white",
  border: "none",
  padding: "1rem 2rem",
  fontSize: "1.1rem",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.2s",
  ":hover": {
    background: "#cc5500",
    transform: "translateY(-2px)",
  },
  "@media": {
    "(max-width: 768px)": {
      width: "100%",
      maxWidth: "300px",
    },
  },
});

export const heroVisual = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const heroSplit = style({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  "@media": {
    "(max-width: 768px)": {
      gap: "1rem",
      alignItems: "center",
    },
  },
});

export const slackCaseImage = style({
  borderRadius: "1rem",
  overflow: "hidden",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
});

export const slackScreenshot = style({
  width: "100%",
  height: "auto",
  display: "block",
});

export const analyticsTiles = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1rem",
});

export const statTile = style({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "0.5rem",
  padding: "1rem",
  textAlign: "center",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
});

export const statLabel = style({
  fontSize: "0.75rem",
  color: "#6b7280",
  marginBottom: "0.25rem",
  fontWeight: 500,
});

export const statValue = style({
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "#10b981",
});
