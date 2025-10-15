import { container } from "@/styles/landing/base.css";
import * as styles from "@/styles/landing/pricing.css";

export default function PricingSection() {
  return (
    <section className={styles.pricing}>
      <div className={container}>
        <h2 className={styles.pricingTitle}>Simple, transparent pricing</h2>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <h3 className={styles.pricingCardTitle}>Free</h3>
            <div className={styles.price}>
              $0<span className={styles.priceUnit}>/month</span>
            </div>
            <p className={styles.pricingDescription}>
              Start free—full features for a small team
            </p>
            <ul className={styles.featuresList}>
              <li className={styles.featuresListItem}>
                ✓ 1 git provider (GitHub, GitLab, or Bitbucket)
              </li>
              <li className={styles.featuresListItem}>
                ✓ 1 messaging provider (Slack, Discord, or Teams)
              </li>
              <li className={styles.featuresListItem}>
                ✓ 1 notification schedule
              </li>
              <li className={styles.featuresListItem}>
                ✓ Daily notifications minimum
              </li>
              <li className={styles.featuresListItem}>✓ Community support</li>
            </ul>
            <a href="/dashboard">
              <button className={styles.pricingButtonSecondary}>
                Get started
              </button>
            </a>
          </div>

          <div className={styles.pricingCardFeatured}>
            <div className={styles.popularBadge}>Most Popular</div>
            <h3 className={styles.pricingCardTitleFeatured}>Pro</h3>
            <div className={styles.price}>
              $15<span className={styles.priceUnit}>/month</span>
            </div>
            <p className={styles.pricingDescription}>
              Scale by repos/channels, not surprises
            </p>
            <ul className={styles.featuresList}>
              <li className={styles.featuresListItem}>
                ✓ Unlimited git providers
              </li>
              <li className={styles.featuresListItem}>
                ✓ Unlimited messaging providers
              </li>
              <li className={styles.featuresListItem}>
                ✓ Unlimited notification schedules
              </li>
              <li className={styles.featuresListItem}>
                ✓ Any frequency (hourly, daily, etc.)
              </li>
              <li className={styles.featuresListItem}>✓ Escalation rules</li>
              <li className={styles.featuresListItem}>✓ Priority support</li>
            </ul>
            <a href="/dashboard">
              <button className={styles.pricingButtonPrimary}>
                Start free trial
              </button>
            </a>
          </div>

          <div className={styles.pricingCard}>
            <h3 className={styles.pricingCardTitle}>Enterprise</h3>
            <div className={styles.price}>Custom</div>
            <p className={styles.pricingDescription}>Cancel anytime</p>
            <ul className={styles.featuresList}>
              <li className={styles.featuresListItem}>✓ Everything in Pro</li>
              <li className={styles.featuresListItem}>✓ SSO integration</li>
              <li className={styles.featuresListItem}>✓ Advanced analytics</li>
              <li className={styles.featuresListItem}>✓ Custom integrations</li>
              <li className={styles.featuresListItem}>✓ Dedicated support</li>
            </ul>
            <a href="mailto:hello@hotbot.sh">
              <button className={styles.pricingButtonSecondary}>
                Contact sales
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
