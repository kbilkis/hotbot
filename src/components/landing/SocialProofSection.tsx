import * as styles from "@/styles/landing/social-proof.css";
import { utils } from "@/styles/theme/index.css";

export default function SocialProofSection() {
  return (
    <section className={styles.socialProof}>
      <div className={utils.container}>
        <div className={styles.socialProofHeader}>
          <p className={styles.socialProofText}>
            Trusted by engineering teams at fast-growing companies
          </p>
        </div>

        <div className={styles.testimonialGrid}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <blockquote className={styles.testimonialQuote}>
                PRs stopped languishing—reviews happen before lunch. Our median
                review time dropped from 3.2 days to 1.1 days.
              </blockquote>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>SC</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>Sarah Chen</div>
                  <div className={styles.authorTitle}>
                    Staff Engineer, Fintech Startup
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <blockquote className={styles.testimonialQuote}>
                Finally, a tool that respects our team&apos;s workflow. Smart
                escalation means no more awkward Slack pings.
              </blockquote>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>MR</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>Mike Rodriguez</div>
                  <div className={styles.authorTitle}>
                    Engineering Manager, SaaS Platform
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>38%</div>
            <div className={styles.statLabel}>Faster Review Times</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>52%</div>
            <div className={styles.statLabel}>Fewer Stale PRs</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>86%</div>
            <div className={styles.statLabel}>Team Read Rate</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>5min</div>
            <div className={styles.statLabel}>Setup Time</div>
          </div>
        </div>

        <div className={styles.securityBadges}>
          <div className={styles.securityBadge}>
            <span className={styles.badgeIcon}>🛡️</span>
            <span>GDPR Compliant</span>
          </div>
          <div className={styles.securityBadge}>
            <span className={styles.badgeIcon}>🔐</span>
            <span>Read-Only Access</span>
          </div>
        </div>
      </div>
    </section>
  );
}
