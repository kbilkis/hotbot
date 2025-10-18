import { useState } from "preact/hooks";

import { subscriptionsApi } from "@/lib/api/client";

interface UpgradeState {
  loading: boolean;
  error: string | null;
}

export function useUpgrade() {
  const [state, setState] = useState<UpgradeState>({
    loading: false,
    error: null,
  });

  const startUpgrade = async () => {
    try {
      setState({ loading: true, error: null });

      // Get current URL for success/cancel redirects
      const baseUrl = globalThis.window.location.origin;
      const successUrl = `${baseUrl}/upgrade/success`;
      const cancelUrl = `${baseUrl}/upgrade/cancel`;

      const response = await subscriptionsApi.checkout.$post({
        json: {
          successUrl,
          cancelUrl,
        },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage = data.error || "Failed to create checkout session";
        throw new Error(errorMessage);
      }

      const checkoutUrl = data.checkoutUrl;
      if (checkoutUrl) {
        // Redirect to Stripe Checkout
        globalThis.window.location.href = checkoutUrl;
      } else {
        console.error("Upgrade not available at this moment.");
        setState({
          loading: false,
          error: "Upgrade not available at this moment.",
        });
      }
    } catch (err) {
      console.error("Upgrade failed:", err);
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
    startUpgrade,
    clearError,
  };
}
