import * as authStyles from "../styles/auth/auth.css";
import { contentCard } from "../styles/layout/layout.css";
import { button } from "../styles/theme/index.css";

export default function UpgradeCancel() {
  return (
    <div className={contentCard({ size: "fullPage" })}>
      <div className={authStyles.upgradeResultContentCancel}>
        <div className={authStyles.cancelIcon}>✕</div>
        <h1>Upgrade Cancelled</h1>
        <p>
          No worries! Your upgrade was cancelled and no charges were made. You
          can upgrade to Pro anytime from your dashboard.
        </p>
        <div className={authStyles.upgradeBenefits}>
          <h3>Pro Benefits You&apos;re Missing:</h3>
          <ul className={authStyles.featureList}>
            <li>Unlimited active repositories</li>
            <li>Unlimited messaging providers</li>
            <li>Unlimited schedules</li>
            <li>Any schedule frequency (no 24-hour minimum)</li>
          </ul>
        </div>
        <div className={authStyles.actionButtons}>
          <a href="/dashboard" className={button({ color: "primary" })}>
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
