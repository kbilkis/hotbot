import { useState } from "preact/hooks";

import { subscriptionsApi } from "@/lib/api/client";

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
      const returnUrl = globalThis.window.location.href;

      const response = await subscriptionsApi.portal.$post({
        json: {
          returnUrl,
        },
      });

      const data = await response.json();

      if (!data.success) {
        const errorMessage =
          data.message ||
          data.error ||
          "Failed to create billing portal session";
        throw new Error(errorMessage);
      }

      const portalUrl = data.portalUrl;

      // Redirect to Stripe Customer Portal
      globalThis.window.location.href = portalUrl;
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
