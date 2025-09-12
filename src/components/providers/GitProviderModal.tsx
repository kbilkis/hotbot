import React, { useState, useEffect } from "react";
import { GitProviderData } from "../../lib/validation/provider-schemas";

interface GitProviderModalProps {
  provider: GitProviderData;
  onClose: () => void;
}

export default function GitProviderModal({
  provider,
  onClose,
}: GitProviderModalProps): React.ReactElement {
  const [accessToken, setAccessToken] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const providerConfig = {
    github: { name: "GitHub", placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx" },
    gitlab: { name: "GitLab", placeholder: "glpat-xxxxxxxxxxxxxxxxxxxx" },
    bitbucket: { name: "Bitbucket", placeholder: "ATBB-xxxxxxxxxxxxxxxxxxxx" },
  };

  const config = providerConfig[provider.provider];

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      setError("Access token is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the connect API endpoint
      const response = await fetch(
        `/api/providers/git/${provider.provider}/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: accessToken.trim(),
            repositoryUrl: repositoryUrl.trim() || undefined,
          }),
        }
      );

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

      const data = await response.json();
      console.log("Successfully connected git provider:", data);

      onClose();
    } catch (err) {
      console.error("Failed to connect git provider:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect provider"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Connect Git Provider</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            {provider.connected
              ? `Manage your ${config.name} connection and settings.`
              : `Connect your ${config.name} account to receive notifications for pull requests and repository events.`}
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="git-provider-display">Git Provider</label>
            <div className="provider-display">
              <span className="provider-name">{config.name}</span>
              {provider.connected && (
                <span className="connection-status connected">✓ Connected</span>
              )}
            </div>
          </div>

          {!provider.connected && (
            <div className="form-group">
              <label htmlFor="access-token">
                Access Token <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">🔑</span>
                <input
                  id="access-token"
                  type="password"
                  className="form-input"
                  placeholder={config.placeholder}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
              </div>
              <small className="form-help">
                Generate a personal access token from your {config.name}{" "}
                settings
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="repository-url">
              Repository URL <span className="optional">(Optional)</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">📁</span>
              <input
                id="repository-url"
                type="url"
                className="form-input"
                placeholder="https://github.com/username/repository"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
              />
            </div>
            <small className="form-help">
              Leave empty to monitor all repositories you have access to
            </small>
          </div>
        </div>

        <div className="modal-footer">
          {provider.connected ? (
            <div className="connected-actions">
              <button className="disconnect-button" disabled={loading}>
                Disconnect
              </button>
              <button className="update-button" disabled={loading}>
                Update Settings
              </button>
            </div>
          ) : (
            <button
              className="connect-button-modal"
              onClick={handleConnect}
              disabled={!accessToken.trim() || loading}
            >
              {loading ? "Connecting..." : `Connect ${config.name}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
