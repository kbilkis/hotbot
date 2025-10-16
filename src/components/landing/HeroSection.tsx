import * as styles from "@/styles/landing/hero.css";
import { button } from "@/styles/theme/index.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Never let a pull request fall through the cracks
          </h1>
          <p className={styles.heroSubtitle}>
            HotBot automatically tracks pull requests and sends intelligent
            daily summaries to your team&apos;s Slack, Discord, or Teams
            channels—reducing review time by 38% on average.
          </p>
          <p className={styles.heroDescription}>
            Stop chasing reviewers. Get standup-ready summaries, smart
            escalation, and actionable insights that keep your development
            velocity high.
          </p>
          <div className={styles.heroButtons}>
            <a href="/dashboard">
              <button className={button({ color: "primary", size: "lg" })}>
                Start Free Trial - No Credit Card
              </button>
            </a>
            <a href="#how-it-works" className={styles.secondaryButton}>
              <button className={button({ color: "outline", size: "lg" })}>
                See How It Works
              </button>
            </a>
          </div>
          <div className={styles.heroGuarantee}>
            <span className={styles.guaranteeIcon}>✅</span>
            <span>14-day free trial • Cancel anytime • Setup in 5 minutes</span>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroSplit}>
            <div className={styles.slackCaseImage}>
              <picture>
                <source
                  media="(max-width: 768px)"
                  srcSet="/images/landing/slack-case-mobile.webp"
                  width="563"
                  height="1019"
                />
                <source
                  media="(min-width: 769px)"
                  srcSet="/images/landing/slack-case.webp"
                  width="1972"
                  height="1182"
                />
                <img
                  src="/images/landing/slack-case.webp"
                  alt="Slack PR digest showing daily pull request summaries with review status and quick actions"
                  className={styles.slackScreenshot}
                  width="1972"
                  height="1182"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>
            <div className={styles.analyticsTiles}>
              <div className={styles.statTile}>
                <div className={styles.statLabel}>Median review time</div>
                <div className={styles.statValue}>↓ 38%</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.statLabel}>Stale PRs</div>
                <div className={styles.statValue}>↓ 52%</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.statLabel}>Read rate</div>
                <div className={styles.statValue}>86%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
