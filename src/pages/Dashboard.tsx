import React from "react";
import IntegrationsSection from "../components/integrations/IntegrationsSection";
import SchedulesSection from "../components/schedules/SchedulesSection";

export default function Dashboard(): React.ReactElement {
  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <IntegrationsSection />
        <SchedulesSection />
      </div>
    </div>
  );
}
