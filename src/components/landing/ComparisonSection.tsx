import * as styles from "@/styles/landing/comparison.css";
import { utils, button } from "@/styles/theme/index.css";

export default function ComparisonSection() {
  return (
    <section className={styles.comparison}>
      <div className={utils.container}>
        <h2 className={styles.comparisonTitle}>Why HotBot vs. alternatives?</h2>
        <p className={styles.comparisonSubtitle}>
          See how HotBot compares to other solutions your team might be
          considering
        </p>

        <div className={styles.comparisonTable}>
          <div className={styles.comparisonHeader}>
            <div className={styles.featureColumn}>Feature</div>
            <div className={styles.hotbotColumn}>
              <div className={styles.solutionName}>HotBot</div>
              <div className={styles.solutionBadge}>Recommended</div>
            </div>
            <div className={styles.solutionColumn}>
              <div className={styles.solutionName}>GitHub Notifications</div>
              <div className={styles.solutionType}>Built-in</div>
            </div>
            <div className={styles.solutionColumn}>
              <div className={styles.solutionName}>Manual Solutions</div>
              <div className={styles.solutionType}>DIY</div>
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.featureCell}>
              <strong>Smart noise filtering</strong>
              <p>Excludes drafts, WIP, already reviewed</p>
            </div>
            <div className={styles.hotbotCell}>
              <span className={styles.checkmark}>✅</span>
              <span>Built-in intelligence</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.cross}>❌</span>
              <span>All notifications (noisy)</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.cross}>❌</span>
              <span>Manual effort required</span>
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.featureCell}>
              <strong>Team-wide summaries</strong>
              <p>Daily digest for entire team</p>
            </div>
            <div className={styles.hotbotCell}>
              <span className={styles.checkmark}>✅</span>
              <span>Automated daily</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.cross}>❌</span>
              <span>Individual only</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.partial}>⚠️</span>
              <span>Manual creation</span>
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.featureCell}>
              <strong>Smart escalation</strong>
              <p>Automatic escalation to team leads</p>
            </div>
            <div className={styles.hotbotCell}>
              <span className={styles.checkmark}>✅</span>
              <span>Configurable rules</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.cross}>❌</span>
              <span>No escalation</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.cross}>❌</span>
              <span>Manual tracking</span>
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.featureCell}>
              <strong>Setup time</strong>
              <p>Time to get up and running</p>
            </div>
            <div className={styles.hotbotCell}>
              <span className={styles.checkmark}>✅</span>
              <span>5 minutes</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.checkmark}>✅</span>
              <span>Already enabled</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.cross}>❌</span>
              <span>Hours of setup</span>
            </div>
          </div>

          <div className={styles.comparisonRow}>
            <div className={styles.featureCell}>
              <strong>Maintenance required</strong>
              <p>Ongoing effort to keep working</p>
            </div>
            <div className={styles.hotbotCell}>
              <span className={styles.checkmark}>✅</span>
              <span>Zero maintenance</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.checkmark}>✅</span>
              <span>No maintenance</span>
            </div>
            <div className={styles.solutionCell}>
              <span className={styles.cross}>❌</span>
              <span>Constant updates needed</span>
            </div>
          </div>
        </div>

        {/* Mobile-friendly comparison cards */}
        <div className={styles.mobileComparison}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Why choose HotBot?
            </h3>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>
              See how we compare to other solutions
            </p>
          </div>
          <div className={styles.mobileComparisonCards}>
            <div className={styles.mobileComparisonCard}>
              <div className={styles.mobileCardHeader}>
                <h3 className={styles.mobileCardTitle}>
                  HotBot vs GitHub Notifications
                </h3>
                <span className={styles.mobileCardBadge}>Recommended</span>
              </div>
              <div className={styles.mobileFeatureComparison}>
                <div className={styles.mobileFeatureRow}>
                  <span className={styles.mobileFeatureName}>
                    Smart noise filtering
                  </span>
                  <div className={styles.mobileFeatureResults}>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>✅</span>
                      <span className={styles.mobileFeatureLabel}>HotBot</span>
                    </div>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>❌</span>
                      <span className={styles.mobileFeatureLabel}>GitHub</span>
                    </div>
                  </div>
                </div>
                <div className={styles.mobileFeatureRow}>
                  <span className={styles.mobileFeatureName}>
                    Team summaries
                  </span>
                  <div className={styles.mobileFeatureResults}>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>✅</span>
                      <span className={styles.mobileFeatureLabel}>HotBot</span>
                    </div>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>❌</span>
                      <span className={styles.mobileFeatureLabel}>GitHub</span>
                    </div>
                  </div>
                </div>
                <div className={styles.mobileFeatureRow}>
                  <span className={styles.mobileFeatureName}>
                    Smart escalation
                  </span>
                  <div className={styles.mobileFeatureResults}>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>✅</span>
                      <span className={styles.mobileFeatureLabel}>HotBot</span>
                    </div>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>❌</span>
                      <span className={styles.mobileFeatureLabel}>GitHub</span>
                    </div>
                  </div>
                </div>
                <div className={styles.mobileFeatureRow}>
                  <span className={styles.mobileFeatureName}>Analytics</span>
                  <div className={styles.mobileFeatureResults}>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>✅</span>
                      <span className={styles.mobileFeatureLabel}>HotBot</span>
                    </div>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>❌</span>
                      <span className={styles.mobileFeatureLabel}>GitHub</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.mobileComparisonCard}>
              <div className={styles.mobileCardHeader}>
                <h3 className={styles.mobileCardTitle}>
                  HotBot vs Manual Solutions
                </h3>
                <span className={styles.mobileCardBadge}>Recommended</span>
              </div>
              <div className={styles.mobileFeatureComparison}>
                <div className={styles.mobileFeatureRow}>
                  <span className={styles.mobileFeatureName}>Setup time</span>
                  <div className={styles.mobileFeatureResults}>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>✅</span>
                      <span className={styles.mobileFeatureLabel}>5 min</span>
                    </div>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>❌</span>
                      <span className={styles.mobileFeatureLabel}>Hours</span>
                    </div>
                  </div>
                </div>
                <div className={styles.mobileFeatureRow}>
                  <span className={styles.mobileFeatureName}>Maintenance</span>
                  <div className={styles.mobileFeatureResults}>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>✅</span>
                      <span className={styles.mobileFeatureLabel}>Zero</span>
                    </div>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>❌</span>
                      <span className={styles.mobileFeatureLabel}>
                        Constant
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.mobileFeatureRow}>
                  <span className={styles.mobileFeatureName}>Automation</span>
                  <div className={styles.mobileFeatureResults}>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>✅</span>
                      <span className={styles.mobileFeatureLabel}>Full</span>
                    </div>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>❌</span>
                      <span className={styles.mobileFeatureLabel}>Manual</span>
                    </div>
                  </div>
                </div>
                <div className={styles.mobileFeatureRow}>
                  <span className={styles.mobileFeatureName}>Reliability</span>
                  <div className={styles.mobileFeatureResults}>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>✅</span>
                      <span className={styles.mobileFeatureLabel}>High</span>
                    </div>
                    <div className={styles.mobileFeatureResult}>
                      <span className={styles.mobileFeatureIcon}>⚠️</span>
                      <span className={styles.mobileFeatureLabel}>
                        Variable
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.comparisonCTA}>
          <h3 className={styles.ctaTitle}>
            Ready to upgrade your PR workflow?
          </h3>
          <p className={styles.ctaDescription}>
            Join teams who&apos;ve reduced their review time by 38% with
            HotBot&apos;s intelligent automation.
          </p>
          <a href="/dashboard">
            <button className={button({ color: "primary", size: "lg" })}>
              Start Free Trial - No Credit Card Required
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
