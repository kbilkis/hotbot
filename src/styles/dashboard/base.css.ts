import { style } from "@vanilla-extract/css";

export const dashboard = style({
  minHeight: "calc(100vh - 80px)",
  paddingTop: 0,
  background: "transparent",
});

export const dashboardContainer = style({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 1rem",
});

export const section = style({
  marginBottom: "3rem",
});

export const sectionHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "0 2rem",
  marginBottom: "1.5rem",
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
      gap: "1rem",
      alignItems: "stretch",
    },
  },
});

export const sectionContent = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
});

export const sectionTitle = style({
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "0.25rem",
  lineHeight: 1.2,
});

export const sectionDescription = style({
  color: "#6b7280",
  fontSize: "0.875rem",
  lineHeight: 1.4,
  margin: 0,
});

export const integrationsGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "2rem",
  padding: "0 2rem",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
      padding: "0 1rem",
    },
  },
});
