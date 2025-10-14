import { style } from "@vanilla-extract/css";

// Smart Git Webhooks Section
export const smartWebhooks = style({
  padding: "6rem 0",
  position: "relative",
  zIndex: 2,
  background: "transparent",
});

export const featureHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  marginBottom: "2rem",
});

export const comingSoonBadge = style({
  background: "#ff6b35",
  color: "white",
  fontSize: "0.75rem",
  fontWeight: 600,
  padding: "0.25rem 0.75rem",
  borderRadius: "1rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

export const featureSubtitle = style({
  fontSize: "1.25rem",
  color: "#6b7280",
  textAlign: "center",
  marginBottom: "3rem",
  lineHeight: 1.6,
});

export const webhooksDemo = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "3rem",
  alignItems: "start",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gap: "2rem",
    },
  },
});

export const demoDescription = style({
  padding: "2rem",
});

export const webhooksFeatures = style({
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  marginTop: "2rem",
});

export const webhookFeature = style({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
});

export const featureIcon = style({
  color: "#ff8000",
  flexShrink: 0,
});

// Slack Mockup
export const slackMockup = style({
  background: "rgba(255, 255, 255, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "1rem",
  overflow: "hidden",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
});

export const slackHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 1.5rem",
  background: "#4a154b",
  color: "white",
});

export const slackChannel = style({
  fontWeight: 600,
});

export const slackMembers = style({
  fontSize: "0.875rem",
  opacity: 0.8,
});

export const slackMessages = style({
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const slackMessage = style({
  display: "flex",
  gap: "0.75rem",
});

export const messageAvatar = style({
  width: "36px",
  height: "36px",
  borderRadius: "0.25rem",
  overflow: "hidden",
  flexShrink: 0,
});

export const messageContent = style({
  flex: 1,
});

export const messageHeader = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "0.5rem",
});

export const botName = style({
  fontWeight: 600,
  color: "#1d1c1d",
});

export const messageTime = style({
  fontSize: "0.75rem",
  color: "#616061",
});

export const prCard = style({
  background: "#f8f9fa",
  border: "1px solid #e1e5e9",
  borderRadius: "0.5rem",
  padding: "1rem",
});

export const prHeader = style({
  marginBottom: "0.75rem",
});

export const prTitle = style({
  fontWeight: 600,
  color: "#1264a3",
  textDecoration: "none",
  display: "block",
  marginBottom: "0.25rem",
});

export const prMeta = style({
  fontSize: "0.875rem",
  color: "#616061",
  display: "flex",
  gap: "0.5rem",
});

export const prAuthor = style({
  color: "#1264a3",
});

export const prNumber = style({
  color: "#616061",
});

export const prDescription = style({
  fontSize: "0.875rem",
  color: "#1d1c1d",
  lineHeight: 1.4,
  marginBottom: "0.75rem",
});

export const prReviewers = style({
  fontSize: "0.875rem",
  marginBottom: "0.75rem",
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
});

export const reviewersLabel = style({
  color: "#616061",
});

export const reviewer = style({
  color: "#1264a3",
});

export const reviewerApproved = style([
  reviewer,
  {
    color: "#2eb67d",
  },
]);

export const prStatus = style({
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
});

export const statusItem = style({
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  fontSize: "0.75rem",
});

export const statusItemSuccess = style([
  statusItem,
  {
    color: "#2eb67d",
  },
]);

export const statusItemWarning = style([
  statusItem,
  {
    color: "#ecb22e",
  },
]);

export const statusIcon = style({
  fontSize: "0.875rem",
});

// Features for Engineers Section
export const featuresEngineers = style({
  padding: "6rem 0",
  position: "relative",
  zIndex: 2,
  background: "transparent",
});

export const featuresEngineersContent = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "3rem",
  alignItems: "start",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gap: "2rem",
    },
  },
});

export const featuresList = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const featureBullet = style({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
});

export const bullet = style({
  color: "#ff8000",
  fontWeight: "bold",
  fontSize: "1.25rem",
  lineHeight: 1,
  marginTop: "0.125rem",
});

export const ruleBuilderCard = style({
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "1rem",
  padding: "1.5rem",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
});

export const ruleHeader = style({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "1rem",
  textAlign: "center",
});

export const ruleContent = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const ruleSection = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap",
});

export const ruleLabel = style({
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#6b7280",
  minWidth: "80px",
});

export const ruleChip = style({
  background: "#f3f4f6",
  color: "#374151",
  padding: "0.25rem 0.75rem",
  borderRadius: "1rem",
  fontSize: "0.875rem",
  fontWeight: 500,
});

export const ruleChips = style({
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
});

// Social Proof Section
export const socialProof = style({
  padding: "6rem 0",
  background: "rgba(249, 250, 251, 0.8)",
  backdropFilter: "blur(20px)",
  borderTop: "1px solid rgba(148, 163, 184, 0.2)",
  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
  position: "relative",
  zIndex: 2,
});

export const testimonialContent = style({
  maxWidth: "800px",
  margin: "0 auto 3rem",
  textAlign: "center",
});

export const testimonialQuote = style({
  fontSize: "1.75rem",
  fontStyle: "italic",
  fontWeight: 500,
  color: "#4b5563",
  marginBottom: "2rem",
  lineHeight: 1.5,
});

export const testimonialAuthor = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
});

export const authorAvatar = style({
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  overflow: "hidden",
});

export const avatarImage = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const authorInfo = style({
  textAlign: "left",
});

export const authorName = style({
  fontWeight: 600,
  color: "#111827",
});

export const authorTitle = style({
  color: "#6b7280",
  fontSize: "0.875rem",
});

export const caseStudyCard = style({
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "1rem",
  padding: "2rem",
  maxWidth: "500px",
  margin: "0 auto",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
});

export const caseStudyHeader = style({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "1.5rem",
  textAlign: "center",
});

export const caseStudyChart = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const chartSection = style({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
});

export const chartLabel = style({
  fontSize: "0.875rem",
  color: "#6b7280",
  fontWeight: 500,
  minWidth: "60px",
});

export const chartValue = style({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
  minWidth: "80px",
});

export const chartBarBg = style({
  flex: 1,
  height: "20px",
  background: "#f3f4f6",
  borderRadius: "10px",
  overflow: "hidden",
});

export const chartBarFill = style({
  height: "100%",
  borderRadius: "10px",
  transition: "width 0.3s ease",
});

export const chartBarFillBefore = style([
  chartBarFill,
  {
    background: "#ef4444",
  },
]);

export const chartBarFillAfter = style([
  chartBarFill,
  {
    background: "#10b981",
  },
]);

// Analytics Section
export const analyticsSlice = style({
  padding: "6rem 0",
  position: "relative",
  zIndex: 2,
  background: "transparent",
});

export const analyticsTilesGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2rem",
  maxWidth: "800px",
  margin: "0 auto",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const analyticsTile = style({
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "1rem",
  padding: "2rem",
  textAlign: "center",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  ":hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
  },
});

export const tileValue = style({
  fontSize: "2rem",
  fontWeight: 700,
  color: "#111827",
  marginBottom: "0.5rem",
});

export const trendArrow = style({
  fontSize: "1.25rem",
  marginLeft: "0.5rem",
});

export const tileLabel = style({
  fontSize: "0.875rem",
  color: "#6b7280",
  fontWeight: 500,
});

// FAQ Section
export const faq = style({
  padding: "6rem 0",
  position: "relative",
  zIndex: 2,
  background: "transparent",
});

export const faqGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "2rem",
  "@media": {
    "(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const faqItem = style({
  background: "rgba(255, 255, 255, 0.8)",
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: "1rem",
  padding: "2rem",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  ":hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
  },
});

export const faqQuestion = style({
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#111827",
  marginBottom: "1rem",
});

export const faqAnswer = style({
  color: "#6b7280",
  lineHeight: 1.6,
});

// Common section title
export const sectionTitle = style({
  fontSize: "2.5rem",
  fontWeight: 700,
  textAlign: "center",
  marginBottom: "3rem",
  color: "#111827",
  "@media": {
    "(max-width: 768px)": {
      fontSize: "2rem",
    },
  },
});
