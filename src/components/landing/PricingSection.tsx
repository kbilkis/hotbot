import * as styles from "@/styles/landing/pricing.css";
import { utils, button } from "@/styles/theme/index.css";

export default function PricingSection() {
  return (
    <section className={styles.pricing}>
      <div className={utils.container}>
        <h2 className={styles.pricingTitle}>Simple, transparent pricing</h2>
        <p className={styles.pricingSubtitle}>
          Start free, scale as you grow. No per-user fees, no surprise charges.
        </p>
        <div className={styles.pricingGuarantee}>
          <span className={styles.guaranteeIcon}>✅</span>
          <span>
            14-day free trial on all plans • Cancel anytime • No setup fees
          </span>
        </div>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <h3 className={styles.pricingCardTitle}>Free</h3>
            <div className={styles.price}>
              $0<span className={styles.priceUnit}>/month</span>
            </div>
            <p className={styles.pricingDescription}>
              Perfect for small teams getting started
            </p>
            <div className={styles.pricingValue}>
              <span className={styles.valueLabel}>Great for:</span>
              <span>Teams with 1-5 developers</span>
            </div>
            <ul className={styles.featuresList}>
              <li className={styles.featuresListItem}>
                ✓ 3 active repositories
              </li>
              <li className={styles.featuresListItem}>
                ✓ 1 messaging provider (Slack, Discord, or Teams)
              </li>
              <li className={styles.featuresListItem}>
                ✓ 2 notification schedules
              </li>
              <li className={styles.featuresListItem}>✓ Community support</li>
            </ul>
            <a href="/dashboard">
              <button className={button({ color: "outline" })}>
                Start Free
              </button>
            </a>
            <div className={styles.pricingNote}>No credit card required</div>
          </div>

          <div className={styles.pricingCardFeatured}>
            <div className={styles.popularBadge}>Most Popular</div>
            <h3 className={styles.pricingCardTitleFeatured}>Pro</h3>
            <div className={styles.price}>
              $15<span className={styles.priceUnit}>/month</span>
            </div>
            <div className={styles.priceComparison}>
              <span className={styles.priceNote}>Less than $0.50/day</span>
            </div>
            <p className={styles.pricingDescription}>
              Everything you need for growing engineering teams
            </p>
            <div className={styles.pricingValue}>
              <span className={styles.valueLabel}>Great for:</span>
              <span>Teams with 5-50 developers</span>
            </div>
            <div className={styles.pricingROI}>
              <span>💰 Saves 2+ hours per week per developer</span>
            </div>
            <ul className={styles.featuresList}>
              <li className={styles.featuresListItem}>
                ✓ Everything in Free, plus:
              </li>
              <li className={styles.featuresListItem}>
                ✓ Unlimited active repositories
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
              <li className={styles.featuresListItem}>
                ✓ Smart escalation rules
              </li>
              <li className={styles.featuresListItem}>✓ Priority support</li>
            </ul>
            <a href="/dashboard">
              <button className={button({ color: "primary" })}>
                Start 14-Day Free Trial
              </button>
            </a>
            <div className={styles.pricingNote}>
              No credit card required • Cancel anytime
            </div>
          </div>

          <div className={styles.pricingCard}>
            <h3 className={styles.pricingCardTitle}>Enterprise</h3>
            <div className={styles.price}>Custom</div>
            <p className={styles.pricingDescription}>Cancel anytime</p>
            <ul className={styles.featuresList}>
              <li className={styles.featuresListItem}>✓ Everything in Pro</li>
              <li className={styles.featuresListItem}>✓ SSO integration</li>
              <li className={styles.featuresListItem}>✓ Custom integrations</li>
              <li className={styles.featuresListItem}>✓ Dedicated support</li>
            </ul>
            <a href="mailto:hello@hotbot.sh">
              <button className={button({ color: "outline" })}>
                Contact sales
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
