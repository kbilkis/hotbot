import { style } from "@vanilla-extract/css";

export const pricing = style({
  padding: "6rem 0",
  position: "relative",
  zIndex: 2,
  background: "transparent",
});

export const pricingTitle = style({
  fontSize: "3rem",
  fontWeight: 700,
  textAlign: "center",
  marginBottom: "1rem",
  color: "#111827",
  "@media": {
    "(max-width: 768px)": {
      fontSize: "2rem",
    },
  },
});

export const pricingGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "2rem",
  maxWidth: "1100px",
  margin: "4rem auto 0rem",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const pricingCard = style({
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  padding: "1rem",
  borderRadius: "1rem",
  textAlign: "center",
  position: "relative",
  transition: "all 0.3s ease",
  overflow: "hidden",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  ":hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
  },
});

export const pricingCardFeatured = style([
  pricingCard,
  {
    borderColor: "rgba(255, 128, 0, 0.4)",
    transform: "scale(1.05)",
    boxShadow: "0 25px 50px rgba(255, 128, 0, 0.15)",
    "@media": {
      "(max-width: 768px)": {
        transform: "none",
      },
    },
  },
]);

export const popularBadge = style({
  position: "absolute",
  top: "-12px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#ff8000",
  color: "white",
  padding: "0.5rem 1rem",
  borderRadius: "1rem",
  fontSize: "0.875rem",
  fontWeight: 600,
});

export const pricingCardTitle = style({
  fontSize: "1.5rem",
  fontWeight: 600,
  marginBottom: "1rem",
  color: "#111827",
});

export const pricingCardTitleFeatured = style([
  pricingCardTitle,
  {
    marginTop: "20px",
  },
]);

export const price = style({
  fontSize: "3rem",
  fontWeight: 700,
  color: "#ff8000",
  marginBottom: "0.5rem",
});

export const priceUnit = style({
  fontSize: "1rem",
  color: "#6b7280",
});

export const pricingDescription = style({
  color: "#6b7280",
  marginBottom: "2rem",
});

export const featuresList = style({
  listStyle: "none",
  marginBottom: "2rem",
  textAlign: "left",
  padding: 0,
});

export const featuresListItem = style({
  color: "#374151",
  marginBottom: "0.5rem",
  paddingLeft: "1rem",
});

export const pricingButton = style({
  width: "100%",
  padding: "1rem",
  borderRadius: "0.5rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  border: "none",
  fontSize: "1rem",
});

export const pricingButtonPrimary = style([
  pricingButton,
  {
    background: "#ff8000",
    color: "white",
    ":hover": {
      background: "#cc5500",
    },
  },
]);

export const pricingButtonSecondary = style([
  pricingButton,
  {
    background: "transparent",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    ":hover": {
      borderColor: "#ff8000",
      color: "#ff8000",
    },
  },
]);
