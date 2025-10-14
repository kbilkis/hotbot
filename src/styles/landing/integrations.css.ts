import { style } from "@vanilla-extract/css";

export const integrations = style({
  padding: "4rem 0",
  background: "transparent",
  position: "relative",
  zIndex: 2,
});

export const integrationsTitle = style({
  fontSize: "2rem",
  fontWeight: 700,
  textAlign: "center",
  marginBottom: "3rem",
  color: "#111827",
});

export const integrationsGridLanding = style({
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "2rem",
  alignItems: "center",
  justifyItems: "center",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1rem",
    },
  },
});

export const integrationItem = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  borderRadius: "0.5rem",
  transition: "transform 0.2s ease",
  ":hover": {
    transform: "scale(1.05)",
  },
});

export const integrationLogo = style({
  height: "40px",
  width: "auto",
  objectFit: "contain",
  filter: "grayscale(100%)",
  transition: "filter 0.3s ease",
  ":hover": {
    filter: "grayscale(0%)",
  },
});

export const comingSoonFlair = style({
  position: "absolute",
  top: "-8px",
  right: "-8px",
  background: "#ff6b35",
  color: "white",
  fontSize: "10px",
  fontWeight: 600,
  padding: "2px 6px",
  borderRadius: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});
