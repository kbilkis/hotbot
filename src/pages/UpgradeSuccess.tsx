import { useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";

import * as authStyles from "@/styles/auth/auth.css";
import { contentCard } from "@/styles/layout/layout.css";
import { button } from "@/styles/theme/index.css";

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
    <div className={contentCard({ size: "fullPage" })}>
      <div className={authStyles.upgradeResultContentSuccess}>
        <div className={authStyles.upgradeSuccessIcon}>✓</div>
        <h1>Welcome to Pro!</h1>
        <p>
          Your subscription has been successfully activated. You now have access
          to all Pro features including:
        </p>
        <ul className={authStyles.featureList}>
          <li>Unlimited active repositories</li>
          <li>Unlimited messaging providers</li>
          <li>Unlimited schedules</li>
          <li>Any schedule frequency</li>
        </ul>
        <p className={authStyles.redirectText}>
          Redirecting you to the dashboard in a few seconds...
        </p>
        <a href="/dashboard" className={button({ color: "primary" })}>
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
