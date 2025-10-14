import * as Sentry from "@sentry/react";

import { getViteEnvKey } from "./getViteEnvKey";

export function initSentryClient() {
  const environment = getViteEnvKey("VITE_ENVIRONMENT_DEPL");

  if (typeof window === "undefined" || import.meta.env?.DEV) {
    console.log("Sentry disabled in development environment");
    return;
  }

  Sentry.init({
    dsn: getViteEnvKey("VITE_SENTRY_DSN"),
    environment: environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    tracePropagationTargets: [
      /^https:\/\/hotbot\.sh\/api/,
      /^https:\/\/staging\.hotbot\.sh\/api/,
    ],
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
    tunnel: "/api/tunnel",
  });
}
