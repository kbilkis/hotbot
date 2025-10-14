import SubscriptionStatus from "../components/subscriptions/SubscriptionStatus";
import * as layoutStyles from "../styles/layout/layout.css";

export default function Subscription() {
  return (
    <div className={layoutStyles.dashboard}>
      <div className={layoutStyles.dashboardContainer}>
        <SubscriptionStatus />
      </div>
    </div>
  );
}
