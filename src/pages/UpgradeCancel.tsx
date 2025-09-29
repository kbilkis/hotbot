export default function UpgradeCancel() {
  return (
    <div className="upgrade-result-page">
      <div className="upgrade-result-container">
        <div className="upgrade-result-content cancel">
          <div className="cancel-icon">✕</div>
          <h1>Upgrade Cancelled</h1>
          <p>
            No worries! Your upgrade was cancelled and no charges were made. You
            can upgrade to Pro anytime from your dashboard.
          </p>
          <div className="upgrade-benefits">
            <h3>{`Pro Benefits You're Missing:`}</h3>
            <ul className="feature-list">
              <li>Unlimited Git providers</li>
              <li>Unlimited messaging providers</li>
              <li>Unlimited schedules</li>
              <li>Any schedule frequency (no 24-hour minimum)</li>
            </ul>
          </div>
          <div className="action-buttons">
            <a href="/dashboard">
              <button className="btn btn-primary">Back to Dashboard</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
