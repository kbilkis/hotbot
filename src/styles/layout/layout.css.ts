import { style } from "@vanilla-extract/css";

export const appLayout = style({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

export const header = style({
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
  padding: "1rem 0",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
});

export const nav = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 1rem",
});

export const logo = style({
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#ff8000",
  display: "flex",
  alignItems: "center",
});

export const logoLink = style({
  display: "flex",
});

export const logoImage = style({
  height: "40px",
  width: "auto",
  objectFit: "contain",
  transition: "transform 0.2s ease",
  ":hover": {
    transform: "scale(1.15)",
  },
});

export const navLinks = style({
  display: "flex",
  gap: "1.5rem",
  alignItems: "center",
  "@media": {
    "(max-width: 768px)": {
      gap: "1rem",
    },
  },
});

export const navLink = style({
  color: "#6b7280",
  textDecoration: "none",
  fontWeight: 500,
  transition: "color 0.2s",
  ":hover": {
    color: "#ff8000",
  },
});

export const main = style({
  paddingTop: "120px",
  flex: 1,
});

export const footer = style({
  background: "rgba(249, 250, 251, 0.8)",
  backdropFilter: "blur(20px)",
  borderTop: "1px solid rgba(148, 163, 184, 0.2)",
  color: "#6b7280",
  textAlign: "center",
  padding: "3rem 0",
  marginTop: "auto",
  position: "relative",
  zIndex: 2,
});

export const footerContainer = style({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 1rem",
});
// Dashboard Layout
export const dashboard = style({
  minHeight: "calc(100vh - 80px)",
  paddingTop: "80px", // Account for fixed header
  background: "transparent",
});

export const dashboardContainer = style({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "2rem 1rem",
});
