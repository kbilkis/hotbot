import { useState } from "preact/hooks";

interface BillingState {
  loading: boolean;
  error: string | null;
}

export function useBilling() {
  const [state, setState] = useState<BillingState>({
    loading: false,
    error: null,
  });

  const openBillingPortal = async () => {
    try {
      setState({ loading: true, error: null });

      // Use current URL as return URL
      const returnUrl = window.location.href;

      const response = await fetch("/api/subscriptions/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          returnUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle specific billing portal configuration error
        if (errorData.errorCode === "BILLING_PORTAL_NOT_CONFIGURED") {
          throw new Error(
            "Billing management is temporarily unavailable. Please contact support for subscription changes."
          );
        }

        throw new Error(
          errorData.error || "Failed to create billing portal session"
        );
      }

      const { portalUrl } = await response.json();

      // Redirect to Stripe Customer Portal
      window.location.href = portalUrl;
    } catch (err) {
      console.error("Billing portal access failed:", err);
      setState({
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...state,
    openBillingPortal,
    clearError,
  };
}
