import React from "react";

import SubscriptionStatus from "../components/subscriptions/SubscriptionStatus";

export default function Subscription(): React.ReactElement {
  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <SubscriptionStatus />
      </div>
    </div>
  );
}
