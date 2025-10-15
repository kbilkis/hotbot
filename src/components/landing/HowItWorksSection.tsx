import { container } from "@/styles/landing/base.css";
import * as styles from "@/styles/landing/sections.css";

export default function HowItWorksSection() {
  return (
    <section className={styles.howItWorks}>
      <div className={container}>
        <h2 className={styles.howItWorksTitle}>How it works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Connect Git repos</h3>
            <p className={styles.stepDescription}>
              Link your repositories and grant necessary permissions for PR
              monitoring.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Pick channels and standup time</h3>
            <p className={styles.stepDescription}>
              Choose Slack channels and set your team&apos;s preferred
              notification schedule.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Enable escalation rules</h3>
            <p className={styles.stepDescription}>
              Configure smart escalation thresholds and stakeholder
              notifications.
            </p>
          </div>
        </div>

        <div className={styles.integrationsDemoImage}>
          <img
            src="/images/landing/integrations-demo.jpg"
            alt="Integration setup showing connected GitHub repositories and Slack channels with configuration options"
            className={styles.integrationsScreenshot}
          />
        </div>

        <div className={styles.flowDiagram}>
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <img
                src="/images/providers/github/GitHub_Invertocat_Dark.svg"
                alt="GitHub icon"
              />
            </div>
            <div className={styles.flowLabel}>GitHub</div>
          </div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowStep}>
            <img
              src="/images/hotbot.svg"
              alt="HotBot logo"
              className={styles.integrationsScreenshot}
            />
          </div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <img
                src="/images/providers/slack/SLA-appIcon-iOS.png"
                alt="Slack Icon"
              />
            </div>
          </div>
        </div>

        <div className={styles.ctaRepeat}>
          <button className={styles.ctaPrimary}>
            Add to your favorite messaging platform
          </button>
        </div>
      </div>
    </section>
  );
}
