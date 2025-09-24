import React from "react";

import { useBilling } from "../../hooks/useBilling";
import { useSubscription } from "../../hooks/useSubscription";
import { useUpgrade } from "../../hooks/useUpgrade";
import Tooltip from "../ui/Tooltip";

interface ProgressBarProps {
  current: number;
  max: number | null;
  label: string;
}

function ProgressBar({ current, max, label }: ProgressBarProps) {
  if (max === null) {
    return (
      <div className="usage-item">
        <div className="usage-label">
          <span>{label}</span>
          <span className="usage-count">{current}</span>
        </div>
        <div className="usage-bar unlimited">
          <div className="usage-fill unlimited-fill" />
        </div>
        <span className="usage-text">Unlimited</span>
      </div>
    );
  }

  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isAtLimit = current >= max;

  return (
    <div className="usage-item">
      <div className="usage-label">
        <span>{label}</span>
        <span className={`usage-count ${isAtLimit ? "at-limit" : ""}`}>
          {current}/{max}
        </span>
      </div>
      <div className="usage-bar">
        <div
          className={`usage-fill ${isAtLimit ? "at-limit" : ""}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isAtLimit && <span className="usage-warning">Limit reached</span>}
    </div>
  );
}

export default function SubscriptionStatus(): React.ReactElement {
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
      <div className="section">
        <div className="section-header">
          <div className="section-content">
            <h1>Subscription</h1>
            <p>Loading subscription information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="section-header">
          <div className="section-content">
            <h1>Subscription</h1>
            <p className="error-text">Failed to load subscription: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="section">
        <div className="section-header">
          <div className="section-content">
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
    <div className="section">
      <div className="section-header">
        <div className="section-content">
          <div className="subscription-header">
            <h1>Subscription</h1>
            <div className="tier-badge-container">
              <span className={`tier-badge ${tier}`}>{tier.toUpperCase()}</span>
              {status !== "active" && (
                <span className={`status-badge ${status}`}>
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

      <div className="subscription-content">
        {isFree && (
          <div className="usage-section">
            <div className="usage-header">
              <h3>Usage & Limits</h3>
              <Tooltip text="Free tier has limited resources. Upgrade to Pro for unlimited access." />
            </div>
            <div className="usage-grid">
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
            <div className="cron-limit-info">
              <p>
                <strong>Schedule Frequency:</strong> Minimum 24 hours between
                executions
              </p>
            </div>
          </div>
        )}

        {isPro && (
          <div className="pro-section">
            <div className="pro-features">
              <h3>Pro Features</h3>
              <div className="subscription-grid">
                <div className="subscription-item">
                  <span className="subscription-icon">∞</span>
                  <span>Unlimited Git Providers</span>
                </div>
                <div className="subscription-item">
                  <span className="subscription-icon">∞</span>
                  <span>Unlimited Messaging Providers</span>
                </div>
                <div className="subscription-item">
                  <span className="subscription-icon">∞</span>
                  <span>Unlimited Schedules</span>
                </div>
                <div className="subscription-item">
                  <span className="subscription-icon">⚡</span>
                  <span>Any Schedule Frequency</span>
                </div>
              </div>
            </div>

            {subscription.billing && (
              <div className="billing-info">
                <h3>Billing Information</h3>
                <div className="billing-details">
                  <div className="billing-item">
                    <span className="billing-label">Plan:</span>
                    <span className="billing-value">Pro - $15/month</span>
                  </div>
                  {subscription.billing.currentPeriodEnd && (
                    <div className="billing-item">
                      <span className="billing-label">Next billing date:</span>
                      <span className="billing-value">
                        {new Date(
                          subscription.billing.currentPeriodEnd
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {subscription.billing.cancelAtPeriodEnd && (
                    <div className="billing-item">
                      <span className="billing-label">Status:</span>
                      <span className="billing-value cancel-notice">
                        Cancels at period end
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="subscription-actions">
          {isFree && (
            <div className="upgrade-section">
              {upgradeError && (
                <div className="error-message">
                  <span>{upgradeError}</span>
                  <button
                    className="error-dismiss"
                    onClick={clearError}
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}
              <button
                className="btn btn-primary upgrade-btn"
                onClick={startUpgrade}
                disabled={upgradeLoading}
              >
                {upgradeLoading ? (
                  <>
                    <span className="loading-subscription-spinner"></span>
                    Processing...
                  </>
                ) : (
                  "Upgrade to Pro - $15/month"
                )}
              </button>
            </div>
          )}
          {isPro && (
            <div className="billing-section">
              {billingError && (
                <div className="error-message">
                  <span>{billingError}</span>
                  <button
                    className="error-dismiss"
                    onClick={clearBillingError}
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="billing-actions">
                <button
                  className="btn btn-secondary manage-billing-btn"
                  onClick={openBillingPortal}
                  disabled={billingLoading}
                >
                  {billingLoading ? (
                    <>
                      <span className="loading-subscription-spinner"></span>
                      Opening...
                    </>
                  ) : (
                    "Manage Billing"
                  )}
                </button>
                {billingError &&
                  billingError.includes("temporarily unavailable") && (
                    <div className="support-info">
                      <p>Need to make changes to your subscription?</p>
                      <a
                        href="mailto:hello@hotbot.sh?subject=Subscription Management Request"
                        className="btn btn-outline"
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
