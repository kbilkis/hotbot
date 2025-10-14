import IntegrationsSection from "../components/integrations/IntegrationsSection";
import SchedulesSection from "../components/schedules/SchedulesSection";
import * as styles from "../styles/dashboard/base.css";

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardContainer}>
        <IntegrationsSection />
        <SchedulesSection />
      </div>
    </div>
  );
}
