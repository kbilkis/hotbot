import { useState } from "react";

export interface UpgradeState {
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
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/upgrade/success`;
      const cancelUrl = `${baseUrl}/upgrade/cancel`;

      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          successUrl,
          cancelUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { checkoutUrl } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
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
