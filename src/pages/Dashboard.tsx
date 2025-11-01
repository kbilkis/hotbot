import IntegrationsSection from "@/components/integrations/IntegrationsSection";
import SchedulesSection from "@/components/schedules/SchedulesSection";
import { page } from "@/styles/layout/layout.css";
import { utils } from "@/styles/theme/utils.css";

export default function Dashboard() {
  return (
    <div className={page}>
      <div className={utils.container}>
        <IntegrationsSection />
        <SchedulesSection />
      </div>
    </div>
  );
}
