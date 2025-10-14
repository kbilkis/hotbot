import { container } from "../../styles/landing/base.css";
import * as styles from "../../styles/landing/integrations.css";

export default function IntegrationsSection() {
  return (
    <section className={styles.integrations}>
      <div className={container}>
        <h2 className={styles.integrationsTitle}>Works with your stack</h2>
        <div className={styles.integrationsGridLanding}>
          <div className={styles.integrationItem}>
            <img
              src="/images/providers/github/GitHub_Lockup_Dark.svg"
              alt="GitHub"
              className={styles.integrationLogo}
            />
          </div>
          <div className={styles.integrationItem}>
            <img
              src="/images/providers/gitlab/gitlab-logo-100-rgb.svg"
              alt="GitLab"
              className={styles.integrationLogo}
            />
          </div>
          <div className={styles.integrationItem}>
            <img
              src="/images/providers/bitbucket/Bitbucket_attribution_light.svg"
              alt="Bitbucket"
              className={styles.integrationLogo}
            />
            <div className={styles.comingSoonFlair}>Coming Soon</div>
          </div>
          <div className={styles.integrationItem}>
            <img
              src="/images/providers/slack/SLA-Slack-from-Salesforce-logo.png"
              alt="Slack"
              className={styles.integrationLogo}
            />
          </div>
          <div className={styles.integrationItem}>
            <img
              src="/images/providers/discord/Discord-Logo-Blurple.svg"
              alt="Discord"
              className={styles.integrationLogo}
            />
          </div>
          <div className={styles.integrationItem}>
            <img
              src="/images/providers/teams/icons8-microsoft-teams.svg"
              alt="Microsoft Teams"
              className={styles.integrationLogo}
            />
            <div className={styles.comingSoonFlair}>Coming Soon</div>
          </div>
        </div>
      </div>
    </section>
  );
}
