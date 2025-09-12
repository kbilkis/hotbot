import { useState, useEffect } from "react";
import {
  GitProviderData,
  GitProviderResponseData,
} from "../lib/validation/provider-schemas";

export function useGitProviders() {
  const [providers, setProviders] = useState<GitProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/providers/git", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed: ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data: GitProviderResponseData = await response.json();

      if (data.success && data.data) {
        setProviders(data.data.providers);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to fetch git providers:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch providers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    refetch: fetchProviders,
  };
}
