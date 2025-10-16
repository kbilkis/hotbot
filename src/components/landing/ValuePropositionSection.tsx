import * as chartStyles from "@/styles/landing/charts.css";
import * as styles from "@/styles/landing/sections.css";
import { utils } from "@/styles/theme/index.css";

export default function ValuePropositionSection() {
  return (
    <section className={styles.valueProposition}>
      <div className={utils.container}>
        <h2 className={styles.valueTitle}>
          Ship faster by unblocking reviews.
        </h2>
        <p className={styles.valueSubtitle}>
          Stop losing momentum to forgotten PRs. HotBot keeps your team&apos;s
          code flowing with intelligent automation that respects your workflow.
        </p>
        <div className={styles.valueGrid}>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>📅</div>
            <h3 className={styles.valueItemTitle}>
              Daily PR summaries before standup
            </h3>
            <p className={styles.valueItemDescription}>
              Get a complete picture of pending reviews delivered to your team
              channel every morning. No more &quot;what needs review?&quot;
              questions in standup.
            </p>
            <div className={styles.valueItemBenefit}>
              <span className={styles.benefitIcon}>⚡</span>
              <span>Save 15 minutes per standup</span>
            </div>
          </div>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>🎯</div>
            <h3 className={styles.valueItemTitle}>
              Targeted nudges, not noise
            </h3>
            <p className={styles.valueItemDescription}>
              Smart filters exclude drafts, WIP PRs, and already-reviewed code.
              Only get notified about PRs that actually need your attention.
            </p>
            <div className={styles.valueItemBenefit}>
              <span className={styles.benefitIcon}>🔇</span>
              <span>90% less notification noise</span>
            </div>
          </div>
          <div className={styles.valueItem}>
            <div className={styles.valueIcon}>⚙️</div>
            <h3 className={styles.valueItemTitle}>
              Configurable escalation that respects team norms
            </h3>
            <p className={styles.valueItemDescription}>
              Set custom thresholds for when to escalate stale PRs to team leads
              or managers. Maintain team harmony while ensuring nothing gets
              stuck.
            </p>
            <div className={styles.valueItemBenefit}>
              <span className={styles.benefitIcon}>🎯</span>
              <span>52% fewer stale PRs</span>
            </div>
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
