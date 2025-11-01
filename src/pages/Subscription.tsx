import SubscriptionStatus from "@/components/subscriptions/SubscriptionStatus";
import { page } from "@/styles/layout/layout.css";
import { utils } from "@/styles/theme/utils.css";

export default function Subscription() {
  return (
    <div className={page}>
      <div className={utils.container}>
        <SubscriptionStatus />
      </div>
    </div>
  );
}
