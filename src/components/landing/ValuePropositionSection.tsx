import { container } from "@/styles/landing/base.css";
import * as chartStyles from "@/styles/landing/charts.css";
import * as styles from "@/styles/landing/sections.css";

export default function ValuePropositionSection() {
  return (
    <section className={styles.valueProposition}>
      <div className={container}>
        <h2 className={styles.valueTitle}>
          Ship faster by unblocking reviews.
        </h2>
        <div className={styles.valueGrid}>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>📅</div>
            <h3 className={styles.valueItemTitle}>
              Daily PR summaries before standup
            </h3>
          </div>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>🎯</div>
            <h3 className={styles.valueItemTitle}>
              Targeted nudges, not noise
            </h3>
          </div>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>⚙️</div>
            <h3 className={styles.valueItemTitle}>
              Configurable escalation that respects team norms
            </h3>
          </div>
        </div>
        <div className={chartStyles.beforeAfterChart}>
          <div className={chartStyles.chartTitle}>Review Time Trends</div>
          <div className={chartStyles.chartContainer}>
            <div className={chartStyles.chartBar}>
              <div className={chartStyles.barLabel}>Before</div>
              <div
                className={chartStyles.barBefore}
                style={{ height: "80px" }}
              ></div>
              <div className={chartStyles.barValue}>3.2 days</div>
            </div>
            <div className={chartStyles.chartBar}>
              <div className={chartStyles.barLabel}>After</div>
              <div
                className={chartStyles.barAfter}
                style={{ height: "30px" }}
              ></div>
              <div className={chartStyles.barValue}>1.2 days</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
