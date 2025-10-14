import { style, keyframes, globalStyle } from "@vanilla-extract/css";

// Keyframes
const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

const fadeIn = keyframes({
  "0%": { opacity: 0, transform: "translateY(10px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

// Auth Button Styles
export const authButton = style({
  padding: "0.75rem 1.5rem",
  borderRadius: "0.5rem",
  border: "none",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  background: "#ff8000",
  color: "white",
  ":hover": {
    background: "#cc5500",
    transform: "translateY(-1px)",
  },
  ":disabled": {
    cursor: "not-allowed",
    transform: "none",
  },
});

export const authButtonLoading = style([
  authButton,
  {
    background: "#64748b",
    cursor: "not-allowed",
    ":hover": {
      background: "#64748b",
      transform: "none",
    },
  },
]);

export const authButtonSignOut = style([
  authButton,
  {
    background: "#ef4444",
    ":hover": {
      background: "#dc2626",
    },
  },
]);

export const authButtonSignIn = style([authButton]);

// Auth Section
export const authSection = style({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
      gap: "0.5rem",
      alignItems: "flex-end",
    },
  },
});

export const userEmail = style({
  fontSize: "0.875rem",
  color: "#6b7280",
  fontWeight: 500,
  "@media": {
    "(max-width: 768px)": {
      fontSize: "0.75rem",
    },
  },
});

// Auth Callback Styles
export const authCallbackContainer = style({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  padding: "2rem",
});

export const authCallbackContent = style({
  background: "white",
  borderRadius: "1rem",
  padding: "3rem",
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
  maxWidth: "500px",
  width: "100%",
  animation: `${fadeIn} 0.5s ease-out`,
});

globalStyle(`${authCallbackContent} h2`, {
  margin: "1rem 0 0.5rem 0",
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#111827",
});

globalStyle(`${authCallbackContent} p`, {
  margin: "0.5rem 0",
  color: "#6b7280",
  lineHeight: 1.6,
});

// Status Icons
export const loadingSpinner = style({
  fontSize: "3rem",
  animation: `${spin} 2s linear infinite`,
  marginBottom: "1rem",
});

export const successIcon = style({
  fontSize: "3rem",
  color: "#10b981",
  marginBottom: "1rem",
  animation: `${fadeIn} 0.5s ease-out`,
});

export const errorIcon = style({
  fontSize: "3rem",
  color: "#ef4444",
  marginBottom: "1rem",
  animation: `${fadeIn} 0.5s ease-out`,
});

// Loading States
export const loadingText = style({
  color: "#6b7280",
  fontSize: "1rem",
  fontWeight: 500,
});

export const successText = style({
  color: "#10b981",
  fontSize: "1rem",
  fontWeight: 500,
});

export const errorText = style({
  color: "#ef4444",
  fontSize: "1rem",
  fontWeight: 500,
});

// Responsive Design
export const mobileOptimized = style({
  "@media": {
    "(max-width: 768px)": {
      padding: "1rem",
    },
  },
});

// Mobile typography styles
globalStyle(`${mobileOptimized} h1`, {
  "@media": {
    "(max-width: 768px)": {
      fontSize: "1.5rem",
    },
  },
});

globalStyle(`${mobileOptimized} h2`, {
  "@media": {
    "(max-width: 768px)": {
      fontSize: "1.25rem",
    },
  },
});

globalStyle(`${mobileOptimized} h3`, {
  "@media": {
    "(max-width: 768px)": {
      fontSize: "1.125rem",
    },
  },
});

globalStyle(`${mobileOptimized} p`, {
  "@media": {
    "(max-width: 768px)": {
      fontSize: "0.875rem",
    },
  },
});
// Upgrade Result Pages
export const upgradeResultPage = style({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  padding: "2rem",
});

export const upgradeResultContainer = style({
  background: "white",
  borderRadius: "1rem",
  padding: "3rem",
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
  maxWidth: "600px",
  width: "100%",
  animation: `${fadeIn} 0.5s ease-out`,
});

export const upgradeResultContent = style({});

globalStyle(`${upgradeResultContent} h1`, {
  margin: "1rem 0",
  fontSize: "2rem",
  fontWeight: 700,
  color: "#111827",
});

globalStyle(`${upgradeResultContent} h3`, {
  margin: "1.5rem 0 1rem 0",
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "#374151",
});

globalStyle(`${upgradeResultContent} p`, {
  margin: "1rem 0",
  color: "#6b7280",
  lineHeight: 1.6,
  fontSize: "1rem",
});

export const upgradeResultContentSuccess = style([upgradeResultContent]);

globalStyle(`${upgradeResultContentSuccess} h1`, {
  color: "#10b981",
});

export const upgradeResultContentCancel = style([upgradeResultContent]);

globalStyle(`${upgradeResultContentCancel} h1`, {
  color: "#ef4444",
});

export const upgradeSuccessIcon = style({
  fontSize: "4rem",
  color: "#10b981",
  marginBottom: "1rem",
  display: "block",
  fontWeight: "bold",
});

export const cancelIcon = style({
  fontSize: "4rem",
  color: "#ef4444",
  marginBottom: "1rem",
  display: "block",
  fontWeight: "bold",
});

export const featureList = style({
  textAlign: "left",
  margin: "1.5rem 0",
  padding: "1.5rem",
  background: "#f8fafc",
  borderRadius: "0.75rem",
  border: "1px solid #e2e8f0",
});

globalStyle(`${featureList} li`, {
  margin: "0.5rem 0",
  color: "#374151",
  fontSize: "0.875rem",
  fontWeight: 500,
  paddingLeft: "1rem",
  position: "relative",
});

globalStyle(`${featureList} li::before`, {
  content: '"✓"',
  position: "absolute",
  left: 0,
  color: "#10b981",
  fontWeight: "bold",
});

export const upgradeBenefits = style({
  margin: "2rem 0",
  padding: "1.5rem",
  background: "#fef3c7",
  borderRadius: "0.75rem",
  border: "1px solid #fbbf24",
});

export const redirectText = style({
  fontSize: "0.875rem",
  color: "#9ca3af",
  fontStyle: "italic",
  margin: "2rem 0 1rem 0",
});

export const actionButtons = style({
  display: "flex",
  gap: "1rem",
  justifyContent: "center",
  marginTop: "2rem",
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
    },
  },
});

// Button Styles for Upgrade Pages
export const btnPrimary = style({
  padding: "0.75rem 2rem",
  background: "linear-gradient(135deg, #ff8000 0%, #cc5500 100%)",
  color: "white",
  border: "none",
  borderRadius: "0.5rem",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  textDecoration: "none",
  display: "inline-block",
  ":hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(255, 128, 0, 0.3)",
  },
});

export const btnSecondary = style([
  btnPrimary,
  {
    background: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    ":hover": {
      borderColor: "#9ca3af",
      background: "#f9fafb",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
  },
]);
