import { useBilling } from "../../hooks/useBilling";
import { useSubscription } from "../../hooks/useSubscription";
import { useUpgrade } from "../../hooks/useUpgrade";
import * as subscriptionStyles from "../../styles/subscriptions/subscription.css";
import Tooltip from "../ui/Tooltip";

interface ProgressBarProps {
  current: number;
  max: number | null;
  label: string;
}

function ProgressBar({ current, max, label }: ProgressBarProps) {
  if (max === null) {
    return (
      <div className={subscriptionStyles.usageItem}>
        <div className={subscriptionStyles.usageLabel}>
          <span>{label}</span>
          <span className={subscriptionStyles.usageCount}>{current}</span>
        </div>
        <div className={subscriptionStyles.usageBarUnlimited}>
          <div className={subscriptionStyles.usageFillUnlimited} />
        </div>
        <span className={subscriptionStyles.usageText}>Unlimited</span>
      </div>
    );
  }

  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isAtLimit = current >= max;

  return (
    <div className={subscriptionStyles.usageItem}>
      <div className={subscriptionStyles.usageLabel}>
        <span>{label}</span>
        <span
          className={
            isAtLimit
              ? subscriptionStyles.usageCountAtLimit
              : subscriptionStyles.usageCount
          }
        >
          {current}/{max}
        </span>
      </div>
      <div className={subscriptionStyles.usageBar}>
        <div
          className={
            isAtLimit
              ? subscriptionStyles.usageFillAtLimit
              : subscriptionStyles.usageFill
          }
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isAtLimit && (
        <span className={subscriptionStyles.usageWarning}>Limit reached</span>
      )}
    </div>
  );
}

export default function SubscriptionStatus() {
  const { subscription, loading, error } = useSubscription();
  const {
    loading: upgradeLoading,
    error: upgradeError,
    startUpgrade,
    clearError,
  } = useUpgrade();
  const {
    loading: billingLoading,
    error: billingError,
    openBillingPortal,
    clearError: clearBillingError,
  } = useBilling();

  if (loading) {
    return (
      <div className={subscriptionStyles.section}>
        <div className={subscriptionStyles.sectionHeader}>
          <div className={subscriptionStyles.sectionContent}>
            <h1>Subscription</h1>
            <p>Loading subscription information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={subscriptionStyles.section}>
        <div className={subscriptionStyles.sectionHeader}>
          <div className={subscriptionStyles.sectionContent}>
            <h1>Subscription</h1>
            <p className={subscriptionStyles.errorText}>
              Failed to load subscription: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className={subscriptionStyles.section}>
        <div className={subscriptionStyles.sectionHeader}>
          <div className={subscriptionStyles.sectionContent}>
            <h1>Subscription</h1>
            <p>No subscription information available.</p>
          </div>
        </div>
      </div>
    );
  }

  const { tier, status, usage, limits } = subscription;
  const isFree = tier === "free";
  const isPro = tier === "pro";

  return (
    <div className={subscriptionStyles.section}>
      <div className={subscriptionStyles.sectionHeader}>
        <div className={subscriptionStyles.sectionContent}>
          <div className={subscriptionStyles.subscriptionHeader}>
            <h1>Subscription</h1>
            <div className={subscriptionStyles.tierBadgeContainer}>
              <span
                className={
                  tier === "free"
                    ? subscriptionStyles.tierBadgeFree
                    : subscriptionStyles.tierBadgePro
                }
              >
                {tier.toUpperCase()}
              </span>
              {status !== "active" && (
                <span
                  className={
                    status === "canceled"
                      ? subscriptionStyles.statusBadgeCanceled
                      : status === "past_due"
                      ? subscriptionStyles.statusBadgePastDue
                      : subscriptionStyles.statusBadgeActive
                  }
                >
                  {status.replace("_", " ").toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <p>
            {isFree
              ? "You're on the Free tier with limited features."
              : "You have access to all Pro features."}
          </p>
        </div>
      </div>

      <div className={subscriptionStyles.subscriptionContent}>
        {isFree && (
          <div className={subscriptionStyles.usageSection}>
            <div className={subscriptionStyles.usageHeader}>
              <h3>Usage & Limits</h3>
              <Tooltip text="Free tier has limited resources. Upgrade to Pro for unlimited access." />
            </div>
            <div className={subscriptionStyles.usageGrid}>
              <ProgressBar
                current={usage.gitProvidersCount}
                max={limits.gitProviders}
                label="Git Providers"
              />
              <ProgressBar
                current={usage.messagingProvidersCount}
                max={limits.messagingProviders}
                label="Messaging Providers"
              />
              <ProgressBar
                current={usage.cronJobsCount}
                max={limits.cronJobs}
                label="Schedules"
              />
            </div>
            <div className={subscriptionStyles.cronLimitInfo}>
              <p>
                <strong>Schedule Frequency:</strong> Minimum 24 hours between
                executions
              </p>
            </div>
          </div>
        )}

        {isPro && (
          <div className={subscriptionStyles.proSection}>
            <div className={subscriptionStyles.proFeatures}>
              <h3>Pro Features</h3>
              <div className={subscriptionStyles.subscriptionGrid}>
                <div className={subscriptionStyles.subscriptionItem}>
                  <span className={subscriptionStyles.subscriptionIcon}>∞</span>
                  <span>Unlimited Git Providers</span>
                </div>
                <div className={subscriptionStyles.subscriptionItem}>
                  <span className={subscriptionStyles.subscriptionIcon}>∞</span>
                  <span>Unlimited Messaging Providers</span>
                </div>
                <div className={subscriptionStyles.subscriptionItem}>
                  <span className={subscriptionStyles.subscriptionIcon}>∞</span>
                  <span>Unlimited Schedules</span>
                </div>
                <div className={subscriptionStyles.subscriptionItem}>
                  <span className={subscriptionStyles.subscriptionIcon}>
                    ⚡
                  </span>
                  <span>Any Schedule Frequency</span>
                </div>
              </div>
            </div>

            {subscription.billing && (
              <div className={subscriptionStyles.billingInfo}>
                <h3>Billing Information</h3>
                <div className={subscriptionStyles.billingDetails}>
                  <div className={subscriptionStyles.billingItem}>
                    <span className={subscriptionStyles.billingLabel}>
                      Plan:
                    </span>
                    <span className={subscriptionStyles.billingValue}>
                      Pro - $15/month
                    </span>
                  </div>
                  {subscription.billing.currentPeriodEnd && (
                    <div className={subscriptionStyles.billingItem}>
                      <span className={subscriptionStyles.billingLabel}>
                        Next billing date:
                      </span>
                      <span className={subscriptionStyles.billingValue}>
                        {new Date(
                          subscription.billing.currentPeriodEnd
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {subscription.billing.cancelAtPeriodEnd && (
                    <div className={subscriptionStyles.billingItem}>
                      <span className={subscriptionStyles.billingLabel}>
                        Status:
                      </span>
                      <span className={subscriptionStyles.cancelNotice}>
                        Cancels at period end
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={subscriptionStyles.subscriptionActions}>
          {isFree && (
            <div className={subscriptionStyles.upgradeSection}>
              {upgradeError && (
                <div className={subscriptionStyles.errorMessage}>
                  <span>{upgradeError}</span>
                  <button
                    className={subscriptionStyles.errorDismiss}
                    onClick={clearError}
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}
              <button
                className={subscriptionStyles.upgradeBtn}
                onClick={startUpgrade}
                disabled={upgradeLoading}
              >
                {upgradeLoading ? (
                  <>
                    <span
                      className={subscriptionStyles.loadingSubscriptionSpinner}
                    ></span>
                    Processing...
                  </>
                ) : (
                  "Upgrade to Pro - $15/month"
                )}
              </button>
            </div>
          )}
          {isPro && (
            <div className={subscriptionStyles.billingSection}>
              {billingError && (
                <div className={subscriptionStyles.errorMessage}>
                  <span>{billingError}</span>
                  <button
                    className={subscriptionStyles.errorDismiss}
                    onClick={clearBillingError}
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className={subscriptionStyles.billingActions}>
                <button
                  className={subscriptionStyles.manageBillingBtn}
                  onClick={openBillingPortal}
                  disabled={billingLoading}
                >
                  {billingLoading ? (
                    <>
                      <span
                        className={
                          subscriptionStyles.loadingSubscriptionSpinner
                        }
                      ></span>
                      Opening...
                    </>
                  ) : (
                    "Manage Billing"
                  )}
                </button>
                {billingError &&
                  billingError.includes("temporarily unavailable") && (
                    <div className={subscriptionStyles.supportInfo}>
                      <p>Need to make changes to your subscription?</p>
                      <a
                        href="mailto:hello@hotbot.sh?subject=Subscription Management Request"
                        className={subscriptionStyles.btnOutline}
                      >
                        Contact Support
                      </a>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
