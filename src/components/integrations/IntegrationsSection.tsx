import React from "react";
import GitProviders from "./GitProviders";
import MessagingProviders from "./MessagingProviders";

export default function IntegrationsSection(): React.ReactElement {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-content">
          <h1>Integrations</h1>
          <p>
            Connect your Git and messaging providers to start receiving
            notifications.
          </p>
        </div>
      </div>

      <div className="integrations-grid">
        <GitProviders />
        <MessagingProviders />
      </div>
    </div>
  );
}
