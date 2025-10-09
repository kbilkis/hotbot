import * as Sentry from "@sentry/react";

import IntegrationsSection from "../components/integrations/IntegrationsSection";
import SchedulesSection from "../components/schedules/SchedulesSection";

export default function Dashboard() {
  const apiError = async () => {
    try {
      const res = await fetch("/api/make-error");
      const data: any = await res.json();
      console.log("data=", data.data.data);
    } catch (e) {
      console.error("caught error: ", e);
      throw e;
    }
  };

  const manualThrow = async () => {
    console.log("throwing console");

    throw new Error("manual throw error!");
  };

  const manualSentryCall = async () => {
    console.log("manual react error");
    Sentry.logger.info("User triggered test error", {
      action: "test_error_button_click",
    });
    Sentry.captureException(new Error("manual react error"));
  };
  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <IntegrationsSection />
        <SchedulesSection />
        <div style={{ color: "#F3F4F6" }} onClick={() => apiError()}>
          api error
        </div>
        <div style={{ color: "#F3F4F6" }} onClick={() => manualThrow()}>
          manual throw
        </div>
        <div style={{ color: "#F3F4F6" }} onClick={() => manualSentryCall()}>
          manual sentry
        </div>
      </div>
    </div>
  );
}
