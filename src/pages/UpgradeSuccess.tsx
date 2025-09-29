import { useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";

export default function UpgradeSuccess() {
  const location = useLocation();

  useEffect(() => {
    // Redirect to dashboard after 7 seconds
    const timer = setTimeout(() => {
      location.route("/dashboard");
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

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
          <a href="/dashboard">
            <button className="btn btn-primary">Go to Dashboard</button>
          </a>
        </div>
      </div>
    </div>
  );
}
