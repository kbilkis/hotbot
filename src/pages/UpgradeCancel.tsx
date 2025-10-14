import * as authStyles from "../styles/auth/auth.css";

export default function UpgradeCancel() {
  return (
    <div className={authStyles.upgradeResultPage}>
      <div className={authStyles.upgradeResultContainer}>
        <div
          className={`${authStyles.upgradeResultContentCancel} ${authStyles.mobileOptimized}`}
        >
          <div className={authStyles.cancelIcon}>✕</div>
          <h1>Upgrade Cancelled</h1>
          <p>
            No worries! Your upgrade was cancelled and no charges were made. You
            can upgrade to Pro anytime from your dashboard.
          </p>
          <div className={authStyles.upgradeBenefits}>
            <h3>Pro Benefits You&apos;re Missing:</h3>
            <ul className={authStyles.featureList}>
              <li>Unlimited Git providers</li>
              <li>Unlimited messaging providers</li>
              <li>Unlimited schedules</li>
              <li>Any schedule frequency (no 24-hour minimum)</li>
            </ul>
          </div>
          <div className={authStyles.actionButtons}>
            <a href="/dashboard" className={authStyles.btnPrimary}>
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
