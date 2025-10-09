import * as Sentry from "@sentry/react";

import { getViteEnvKey } from "./getViteEnvKey";

export function initSentryClient() {
  Sentry.init({
    dsn: getViteEnvKey("VITE_SENTRY_DSN"),
    environment: getViteEnvKey("VITE_ENVIRONMENT"),
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
    beforeSend(event) {
      if (event.request?.url?.includes("clerk.hotbot.sh")) {
        return null;
      }
      return event;
    },
  });
}
