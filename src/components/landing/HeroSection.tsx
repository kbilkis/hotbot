import * as styles from "@/styles/landing/hero.css";
import { button } from "@/styles/theme/index.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Never let a pull request fall through the cracks.
          </h1>
          <p className={styles.heroDescription}>
            Daily, standup-ready summaries and smart escalation that keep
            reviews moving.
          </p>
          <div className={styles.heroButtons}>
            <a href="/dashboard">
              <button className={button({ color: "primary", size: "lg" })}>
                Start integrating
              </button>
            </a>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroSplit}>
            <div className={styles.slackCaseImage}>
              <picture>
                <source
                  media="(max-width: 768px)"
                  srcSet="/images/landing/slack-case-mobile.jpg"
                />
                <img
                  src="/images/landing/slack-case.jpg"
                  alt="Slack PR digest showing daily pull request summaries with review status and quick actions"
                  className={styles.slackScreenshot}
                  width="1972"
                  height="1182"
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
