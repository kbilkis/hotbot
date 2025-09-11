import React, { useState } from "react";
import ProviderConnectionModal from "../components/providers/ProviderConnectionModal";
import ScheduleModal from "../components/schedules/ScheduleModal";

interface Provider {
  id: string;
  name: string;
  type: "git" | "messaging";
  connected: boolean;
  icon: string;
}

interface Schedule {
  id: string;
  name: string;
  status: "active" | "paused" | "error";
  lastRun?: string;
  nextRun?: string;
}

export default function Dashboard(): React.ReactElement {
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  const gitProviders: Provider[] = [
    { id: "github", name: "GitHub", type: "git", connected: false, icon: "🐙" },
    { id: "gitlab", name: "GitLab", type: "git", connected: false, icon: "🦊" },
    {
      id: "bitbucket",
      name: "Bitbucket",
      type: "git",
      connected: false,
      icon: "🪣",
    },
  ];

  const messagingProviders: Provider[] = [
    {
      id: "slack",
      name: "Slack",
      type: "messaging",
      connected: false,
      icon: "💬",
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      type: "messaging",
      connected: false,
      icon: "👥",
    },
    {
      id: "discord",
      name: "Discord",
      type: "messaging",
      connected: false,
      icon: "🎮",
    },
  ];

  const schedules: Schedule[] = [
    {
      id: "1",
      name: "Frontend Team Reminders",
      status: "active",
      lastRun: "2024-07-26 10:00 UTC",
      nextRun: "2024-07-27 10:30 UTC",
    },
    {
      id: "2",
      name: "Backend Team Escalations",
      status: "paused",
      lastRun: "2024-07-26 14:30 UTC",
    },
    {
      id: "3",
      name: "Daily Standup Summary",
      status: "error",
      lastRun: "2024-06-26 07:00 UTC",
      nextRun: "2024-07-27 09:00 UTC",
    },
  ];

  const handleConnectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "paused":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Integrations Section */}
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
            <div className="provider-section">
              <h2>Git Providers</h2>
              <p>
                Connect your Git provider to start receiving notifications for
                pull requests.
              </p>
              <div className="provider-list">
                {gitProviders.map((provider) => (
                  <div key={provider.id} className="provider-card">
                    <div className="provider-info">
                      <span className="provider-icon">{provider.icon}</span>
                      <span className="provider-name">{provider.name}</span>
                    </div>
                    <button
                      className="connect-button"
                      onClick={() => handleConnectProvider(provider)}
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="provider-section">
              <h2>Messaging Providers</h2>
              <p>Connect your messaging provider to receive notifications.</p>
              <div className="provider-list">
                {messagingProviders.map((provider) => (
                  <div key={provider.id} className="provider-card">
                    <div className="provider-info">
                      <span className="provider-icon">{provider.icon}</span>
                      <span className="provider-name">{provider.name}</span>
                    </div>
                    <button
                      className="connect-button"
                      onClick={() => handleConnectProvider(provider)}
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schedules Section */}
        <div className="section">
          <div className="section-header">
            <div className="section-content">
              <h1>Schedules</h1>
              <p>Manage your notification schedules and create new ones.</p>
            </div>
            <button
              className="create-schedule-button"
              onClick={() => setShowScheduleModal(true)}
            >
              + Create Schedule
            </button>
          </div>

          <div className="schedules-section">
            <div className="schedules-table">
              <div className="table-header">
                <div>Status</div>
                <div>Name</div>
                <div>Last Run</div>
                <div>Next Run</div>
                <div></div>
              </div>
              {schedules.map((schedule) => (
                <div key={schedule.id} className="table-row">
                  <div className="status-cell">
                    <div
                      className={`status-dot ${getStatusDot(schedule.status)}`}
                    ></div>
                    <span className={getStatusColor(schedule.status)}>
                      {schedule.status.charAt(0).toUpperCase() +
                        schedule.status.slice(1)}
                    </span>
                  </div>
                  <div>{schedule.name}</div>
                  <div>{schedule.lastRun || "-"}</div>
                  <div>{schedule.nextRun || "-"}</div>
                  <div className="actions-cell">
                    <button className="action-button">⋯</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProviderModal && selectedProvider && (
        <ProviderConnectionModal
          provider={selectedProvider}
          onClose={() => {
            setShowProviderModal(false);
            setSelectedProvider(null);
          }}
        />
      )}

      {showScheduleModal && (
        <ScheduleModal onClose={() => setShowScheduleModal(false)} />
      )}
    </div>
  );
}
