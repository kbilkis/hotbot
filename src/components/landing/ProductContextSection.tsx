import { container } from "@/styles/landing/base.css";
import * as styles from "@/styles/landing/sections.css";

export default function ProductContextSection() {
  return (
    <section className={styles.productContext}>
      <div className={container}>
        <h2 className={styles.productContextTitle}>
          Designed to be read in seconds and acted on immediately.
        </h2>
        <div className={styles.contextGrid}>
          <div className={styles.contextCard}>
            <div className={styles.contextHeader}>Morning Slack Digest</div>
            <div className={styles.slackDigestFull}>
              <div className={styles.digestItem}>
                <div className={styles.avatar}>MK</div>
                <div className={styles.details}>
                  <div className={styles.title}>Update API endpoints</div>
                  <div className={styles.meta}>3 days old • @sarah @alex</div>
                </div>
                <div className={styles.actions}>
                  <button>Review</button>
                  <button>Approve</button>
                </div>
              </div>
              <div className={styles.digestItem}>
                <div className={styles.avatar}>JL</div>
                <div className={styles.details}>
                  <div className={styles.title}>Fix mobile layout</div>
                  <div className={styles.meta}>
                    1 day old • Ready for review
                  </div>
                </div>
                <div className={styles.actions}>
                  <button>Review</button>
                  <button>Approve</button>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.contextCard}>
            <div className={styles.contextHeader}>Smart Escalation</div>
            <div className={styles.escalationExample}>
              <div className={styles.escalationMessage}>
                <span className={styles.botIcon}>🤖</span>
                <div className={styles.messageContent}>
                  <div className={styles.messageText}>
                    PR &quot;Fix auth bug&quot; has been waiting 3 days
                  </div>
                  <div className={styles.messageMentions}>
                    Escalating to @team-lead @engineering-manager
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.contextCard}>
            <div className={styles.contextHeader}>Dashboard Overview</div>
            <div className={styles.dashboardPreview}>
              <div className={styles.dashboardStat}>
                <div className={styles.statNumber}>
                  7 <span className={styles.trend}>↓3</span>
                </div>
                <div className={styles.statLabel}>Awaiting Review</div>
              </div>
              <div className={styles.miniSparkline}>
                <div
                  className={styles.sparklineBar}
                  style={{ height: "20px" }}
                ></div>
                <div
                  className={styles.sparklineBar}
                  style={{ height: "15px" }}
                ></div>
                <div
                  className={styles.sparklineBar}
                  style={{ height: "25px" }}
                ></div>
                <div
                  className={styles.sparklineBar}
                  style={{ height: "10px" }}
                ></div>
                <div
                  className={styles.sparklineBar}
                  style={{ height: "8px" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
