import React from "react";
import { useNavigate } from "react-router-dom";

export default function UpgradeCancel(): React.ReactElement {
  const navigate = useNavigate();

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
            <button
              className="btn btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
