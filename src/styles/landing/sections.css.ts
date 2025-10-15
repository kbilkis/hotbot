import { style, globalStyle } from "@vanilla-extract/css";

// Value Proposition Section
export const valueProposition = style({
  padding: "4rem 0",
  background: "transparent",
  position: "relative",
  zIndex: 2,
});

export const valueTitle = style({
  fontSize: "2.5rem",
  fontWeight: 700,
  textAlign: "center",
  marginBottom: "3rem",
  color: "#111827",
});

export const valueGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2rem",
  marginBottom: "3rem",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const valueItem = style({
  textAlign: "center",
  padding: "2rem",
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "1rem",
  transition: "all 0.3s ease",
  ":hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
  },
});

export const valueIcon = style({
  fontSize: "3rem",
  marginBottom: "1rem",
});

export const valueItemTitle = style({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "0.5rem",
});

// Product Context Section
export const productContext = style({
  padding: "4rem 0",
  background: "rgba(249, 250, 251, 0.5)",
  backdropFilter: "blur(20px)",
  borderTop: "1px solid rgba(148, 163, 184, 0.2)",
  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
  position: "relative",
  zIndex: 2,
});

export const productContextTitle = style({
  fontSize: "2rem",
  fontWeight: 700,
  textAlign: "center",
  marginBottom: "3rem",
  color: "#111827",
});

export const contextGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2rem",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const contextCard = style({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "1rem",
  padding: "2rem",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  ":hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
  },
});

export const contextHeader = style({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "1rem",
  textAlign: "center",
});

// How It Works Section
export const howItWorks = style({
  padding: "4rem 0 6rem",
  position: "relative",
  zIndex: 2,
  background: "transparent",
});

export const howItWorksTitle = style({
  fontSize: "2rem",
  fontWeight: 700,
  marginBottom: "3rem",
  color: "#111827",
  textAlign: "center",
});

export const steps = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2rem",
  marginBottom: "3rem",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const step = style({
  textAlign: "center",
});

export const stepNumber = style({
  width: "60px",
  height: "60px",
  border: "2px solid #ff8000",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 1rem",
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#ff8000",
});

export const stepTitle = style({
  fontSize: "1.25rem",
  fontWeight: 600,
  marginBottom: "0.75rem",
  color: "#111827",
});

export const stepDescription = style({
  color: "#6b7280",
  lineHeight: 1.6,
  fontSize: "0.875rem",
});

// Demo and Flow Diagram Styles
export const integrationsDemoImage = style({
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "1rem",
  padding: "1.5rem",
  margin: "2rem 0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
});

export const integrationsScreenshot = style({
  width: "100%",
  height: "auto",
  borderRadius: "0.5rem",
});

export const flowDiagram = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "2rem",
  margin: "3rem 0",
  "@media": {
    "(max-width: 768px)": {
      flexDirection: "column",
      gap: "1rem",
    },
  },
});

export const flowStep = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",
});

export const flowIcon = style({
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
});

globalStyle(`${flowIcon} img`, {
  width: "30px",
  height: "30px",
});

export const flowArrow = style({
  fontSize: "1.5rem",
  color: "#6b7280",
  "@media": {
    "(max-width: 768px)": {
      transform: "rotate(90deg)",
    },
  },
});

export const flowLabel = style({
  fontSize: "0.875rem",
  color: "#6b7280",
  fontWeight: 500,
});

// CTA Repeat Section
export const ctaRepeat = style({
  textAlign: "center",
  marginTop: "3rem",
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
});
// Slack Digest Styles
export const slackDigestFull = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const digestItem = style({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem",
  background: "#f8fafc",
  borderRadius: "0.5rem",
});

export const avatar = style({
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#ff8000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontWeight: 600,
  fontSize: "0.875rem",
});

export const details = style({
  flex: 1,
});

export const title = style({
  fontWeight: 600,
  color: "#111827",
  marginBottom: "0.25rem",
});

export const meta = style({
  fontSize: "0.875rem",
  color: "#6b7280",
});

export const actions = style({
  display: "flex",
  gap: "0.5rem",
});

globalStyle(`${actions} button`, {
  padding: "0.5rem 1rem",
  border: "1px solid #d1d5db",
  background: "white",
  borderRadius: "0.25rem",
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "all 0.2s",
});

globalStyle(`${actions} button:hover`, {
  borderColor: "#ff8000",
  color: "#ff8000",
});

// Escalation Example Styles
export const escalationExample = style({
  padding: "1rem",
  background: "#f8fafc",
  borderRadius: "0.5rem",
});

export const escalationMessage = style({
  display: "flex",
  gap: "0.75rem",
  alignItems: "flex-start",
});

export const botIcon = style({
  fontSize: "1.25rem",
});

export const messageContent = style({
  flex: 1,
});

export const messageText = style({
  fontWeight: 500,
  color: "#111827",
  marginBottom: "0.25rem",
});

export const messageMentions = style({
  fontSize: "0.875rem",
  color: "#6b7280",
});

// Dashboard Preview Styles
export const dashboardPreview = style({
  padding: "1rem",
  background: "#f8fafc",
  borderRadius: "0.5rem",
});

export const dashboardStat = style({
  textAlign: "center",
});

export const statNumber = style({
  fontSize: "2rem",
  fontWeight: 700,
  color: "#111827",
  marginBottom: "0.5rem",
});

export const trend = style({
  fontSize: "1rem",
  color: "#10b981",
});

export const statLabel = style({
  fontSize: "0.875rem",
  color: "#6b7280",
});

// Mini Sparkline Styles
export const miniSparkline = style({
  display: "flex",
  alignItems: "end",
  gap: "2px",
  height: "30px",
  marginTop: "1rem",
  justifyContent: "center",
});

export const sparklineBar = style({
  width: "4px",
  background: "#10b981",
  borderRadius: "2px",
});
