import IntegrationsSection from "../components/integrations/IntegrationsSection";
import SchedulesSection from "../components/schedules/SchedulesSection";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <IntegrationsSection />
        <SchedulesSection />
      </div>
    </div>
  );
}
