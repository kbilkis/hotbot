import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router";

export default function UpgradeSuccess(): React.ReactElement {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after 7 seconds
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 7000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="upgrade-result-page">
      <div className="upgrade-result-container">
        <div className="upgrade-result-content success">
          <div className="upgrade-success-icon">✓</div>
          <h1>Welcome to Pro!</h1>
          <p>
            Your subscription has been successfully activated. You now have
            access to all Pro features including:
          </p>
          <ul className="feature-list">
            <li>Unlimited Git providers</li>
            <li>Unlimited messaging providers</li>
            <li>Unlimited schedules</li>
            <li>Any schedule frequency</li>
          </ul>
          <p className="redirect-text">
            Redirecting you to the dashboard in a few seconds...
          </p>
          <Link to="/dashboard">
            <button className="btn btn-primary">Go to Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
