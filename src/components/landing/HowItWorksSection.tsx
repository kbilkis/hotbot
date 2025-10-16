import * as flowStyles from "@/styles/landing/flow.css";
import * as styles from "@/styles/landing/sections.css";
import { utils, button } from "@/styles/theme/index.css";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className={styles.howItWorks}>
      <div className={utils.container}>
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
            src="/images/landing/integrations-demo.webp"
            alt="Integration setup showing connected GitHub repositories and Slack channels with configuration options"
            className={styles.integrationsScreenshot}
          />
        </div>

        <div className={styles.flowDiagram}>
          {/* Git Providers */}
          <div className={flowStyles.flowProviders}>
            <div className={flowStyles.providerIcon}>
              <img
                src="/images/providers/github/GitHub_Invertocat_Dark.svg"
                alt="GitHub"
              />
            </div>
            <div className={flowStyles.providerIcon}>
              <img
                src="/images/providers/gitlab/gitlab-logo-500-rgb.svg"
                alt="GitLab"
              />
            </div>
            <div className={flowStyles.providerIcon}>
              <img
                src="/images/providers/bitbucket/Bitbucket_mark_brand_RGB.svg"
                alt="Bitbucket"
              />
            </div>
          </div>

          {/* Fluid Arrow */}
          <div className={flowStyles.flowArrowContainer}>
            <div className={flowStyles.fluidArrow}></div>
          </div>

          {/* HotBot Center */}
          <div className={flowStyles.flowCenter}>
            <img
              src="/images/hotbot.svg"
              alt="HotBot"
              className={flowStyles.hotbotLogo}
            />
          </div>

          {/* Fluid Arrow */}
          <div className={flowStyles.flowArrowContainer}>
            <div className={flowStyles.fluidArrow}></div>
          </div>

          {/* Messaging Providers */}
          <div className={flowStyles.flowProviders}>
            <div className={flowStyles.providerIcon}>
              <img
                src="/images/providers/slack/SLA-appIcon-iOS.png"
                alt="Slack"
              />
            </div>
            <div className={flowStyles.providerIcon}>
              <img
                src="/images/providers/discord/Discord-Symbol-Blurple.svg"
                alt="Discord"
              />
            </div>
            <div className={flowStyles.providerIcon}>
              <img
                src="/images/providers/teams/icons8-microsoft-teams.svg"
                alt="Microsoft Teams"
              />
            </div>
          </div>
        </div>

        <div className={styles.ctaRepeat}>
          <a
            href="/dashboard"
            className={button({ color: "primary", size: "lg" })}
          >
            Add to your favorite messaging platform
          </a>
        </div>
      </div>
    </section>
  );
}
