import * as styles from "../../styles/dashboard/base.css";

import GitProviders from "./GitProviders";
import MessagingProviders from "./MessagingProviders";

export default function IntegrationsSection() {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionContent}>
          <h1 className={styles.sectionTitle}>Integrations</h1>
          <p className={styles.sectionDescription}>
            Connect your Git and messaging providers to start receiving
            notifications.
          </p>
        </div>
      </div>

      <div className={styles.integrationsGrid}>
        <GitProviders />
        <MessagingProviders />
      </div>
    </div>
  );
}
