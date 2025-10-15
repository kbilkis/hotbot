import { style, keyframes, globalStyle } from "@vanilla-extract/css";

// Keyframes
const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

// Subscription Header
export const subscriptionHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "1rem",
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "0.5rem",
    },
  },
});

export const tierBadgeContainer = style({
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
});

const tierBadge = style({
  padding: "0.25rem 0.75rem",
  borderRadius: "1rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

export const tierBadgeFree = style([
  tierBadge,
  {
    background: "#f3f4f6",
    color: "#374151",
  },
]);

export const tierBadgePro = style([
  tierBadge,
  {
    background: "linear-gradient(135deg, #ff8000 0%, #cc5500 100%)",
    color: "white",
  },
]);

const statusBadge = style({
  padding: "0.25rem 0.75rem",
  borderRadius: "1rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

export const statusBadgeActive = style([
  statusBadge,
  {
    background: "#dcfce7",
    color: "#166534",
  },
]);

export const statusBadgeCanceled = style([
  statusBadge,
  {
    background: "#fef2f2",
    color: "#dc2626",
  },
]);

export const statusBadgePastDue = style([
  statusBadge,
  {
    background: "#fef3c7",
    color: "#d97706",
  },
]);

// Subscription Content
export const subscriptionContent = style({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
});

// Usage Section
export const usageSection = style({
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.75rem",
  padding: "1.5rem",
});

export const usageHeader = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "1.5rem",
});

globalStyle(`${usageHeader} h3`, {
  margin: 0,
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
});

export const usageGrid = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "1.5rem",
});

export const usageItem = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const usageLabel = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
});

export const usageCount = style({
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#111827",
});

export const usageCountAtLimit = style([
  usageCount,
  {
    color: "#dc2626",
  },
]);

export const usageBar = style({
  width: "100%",
  height: "8px",
  background: "#e5e7eb",
  borderRadius: "4px",
  overflow: "hidden",
});

export const usageBarUnlimited = style([
  usageBar,
  {
    background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
  },
]);

export const usageFill = style({
  height: "100%",
  background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
  borderRadius: "4px",
  transition: "width 0.3s ease",
});

export const usageFillAtLimit = style([
  usageFill,
  {
    background: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
  },
]);

export const usageFillUnlimited = style([
  usageFill,
  {
    background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
    width: "100% !important",
  },
]);

export const usageText = style({
  fontSize: "0.75rem",
  color: "#10b981",
  fontWeight: 600,
  textAlign: "center",
});

export const usageWarning = style({
  fontSize: "0.75rem",
  color: "#dc2626",
  fontWeight: 600,
  textAlign: "center",
});

export const cronLimitInfo = style({
  background: "#fef3c7",
  border: "1px solid #fbbf24",
  borderRadius: "0.5rem",
  padding: "1rem",
});

globalStyle(`${cronLimitInfo} p`, {
  margin: 0,
  fontSize: "0.875rem",
  color: "#92400e",
});

globalStyle(`${cronLimitInfo} strong`, {
  color: "#78350f",
});

// Pro Section
export const proSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
});

export const proFeatures = style({
  background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  border: "1px solid #cbd5e1",
  borderRadius: "0.75rem",
  padding: "1.5rem",
});

globalStyle(`${proFeatures} h3`, {
  margin: "0 0 1rem 0",
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
});

export const subscriptionGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "1rem",
});

export const subscriptionItem = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem",
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
});

export const subscriptionIcon = style({
  fontSize: "1.25rem",
  color: "#10b981",
});

// Billing Section
export const billingInfo = style({
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.75rem",
  padding: "1.5rem",
});

globalStyle(`${billingInfo} h3`, {
  margin: "0 0 1rem 0",
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
});

export const billingDetails = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

export const billingItem = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "0.25rem",
    },
  },
});

export const billingLabel = style({
  fontSize: "0.875rem",
  color: "#6b7280",
  fontWeight: 500,
});

export const billingValue = style({
  fontSize: "0.875rem",
  color: "#111827",
  fontWeight: 600,
});

export const cancelNotice = style([
  billingValue,
  {
    color: "#dc2626",
  },
]);

// Actions Section
export const subscriptionActions = style({
  borderTop: "1px solid #e5e7eb",
  paddingTop: "2rem",
});

export const upgradeSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  alignItems: "center",
  textAlign: "center",
});

export const billingSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const billingActions = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  alignItems: "center",
});

export const supportInfo = style({
  textAlign: "center",
  padding: "1rem",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
});

globalStyle(`${supportInfo} p`, {
  margin: "0 0 0.5rem 0",
  fontSize: "0.875rem",
  color: "#6b7280",
});

// Buttons
export const upgradeBtn = style({
  padding: "0.75rem 2rem",
  background: "linear-gradient(135deg, #ff8000 0%, #cc5500 100%)",
  color: "white",
  border: "none",
  borderRadius: "0.5rem",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  ":hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(255, 128, 0, 0.3)",
  },
  ":disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },
});

export const manageBillingBtn = style({
  padding: "0.75rem 1.5rem",
  background: "white",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  ":hover": {
    borderColor: "#9ca3af",
    background: "#f9fafb",
  },
  ":disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
  },
});

// Loading Spinner
export const loadingSubscriptionSpinner = style({
  width: "1rem",
  height: "1rem",
  border: "2px solid transparent",
  borderTop: "2px solid currentColor",
  borderRadius: "50%",
  animation: `${spin} 1s linear infinite`,
});

// Error Message
export const errorMessage = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem 1rem",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "0.5rem",
  color: "#dc2626",
  fontSize: "0.875rem",
  fontWeight: 500,
});

export const errorDismiss = style({
  background: "none",
  border: "none",
  color: "#dc2626",
  cursor: "pointer",
  padding: "0.25rem",
  borderRadius: "0.25rem",
  fontSize: "1rem",
  ":hover": {
    background: "rgba(220, 38, 38, 0.1)",
  },
});
// Section Layout (for pages that use section structure)
export const section = style({
  background: "white",
  borderRadius: "1rem",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  overflow: "hidden",
});

export const sectionHeader = style({
  padding: "2rem 2rem 1rem",
  borderBottom: "1px solid #e5e7eb",
});

export const sectionContent = style({});

globalStyle(`${sectionContent} h1`, {
  fontSize: "1.875rem",
  fontWeight: 700,
  color: "#111827",
  margin: "0 0 0.5rem 0",
});

globalStyle(`${sectionContent} p`, {
  color: "#6b7280",
  margin: 0,
  lineHeight: 1.6,
});

export const errorText = style({
  color: "#ef4444",
  fontWeight: 500,
});

// Button styles for links
export const btnOutline = style({
  display: "inline-block",
  padding: "0.5rem 1rem",
  background: "transparent",
  color: "#3b82f6",
  border: "1px solid #3b82f6",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  textDecoration: "none",
  cursor: "pointer",
  transition: "all 0.2s",
  ":hover": {
    background: "#3b82f6",
    color: "white",
  },
});
