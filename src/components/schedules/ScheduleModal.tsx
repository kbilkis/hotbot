import CronExpressionParser from "cron-parser";
import React, { useState, useEffect } from "react";

import { useChannels, useDiscordChannels } from "@/hooks/useChannels";
import { usePrefetchRepositories } from "@/hooks/useRepositories";
import { DiscordChannel } from "@/lib/discord";
import { SlackChannel } from "@/lib/slack";
import { getUserTimezoneOrFallback } from "@/lib/utils/timezone";

import { useGitProviders } from "../../hooks/useGitProviders";
import { useMessagingProviders } from "../../hooks/useMessagingProviders";

import CronBuilder from "./CronBuilder";
import FilterBuilder from "./FilterBuilder";

interface ScheduleModalProps {
  onClose: (shouldRefresh?: boolean) => void;
  schedule?: {
    id: string;
    name: string;
    cronExpression: string;
    gitProviderId: string;
    repositories?: string[];
    messagingProviderId: string;
    messagingChannelId: string;
    escalationProviderId?: string;
    escalationChannelId?: string;
    escalationDays?: number;
    prFilters?: {
      labels?: string[];
      titleKeywords?: string[];
    };
    sendWhenEmpty: boolean;
  };
}

interface CronJobFormData {
  name: string;
  cronExpression: string; // Always stored as UTC
  timezone: string; // User's display timezone
  gitProviderId: string;
  repositories: string[];
  messagingProviderId: string;
  messagingChannelId: string;
  escalationProviderId: string;
  escalationChannelId: string;
  escalationDays: number;
  prFilters: {
    labels: string[];
    titleKeywords: string[];
  };
  sendWhenEmpty: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function ScheduleModal({
  onClose,
  schedule,
}: ScheduleModalProps): React.ReactElement {
  const [formData, setFormData] = useState<CronJobFormData>({
    name: "Daily reminder for open Pull Requests",
    cronExpression: "0 16 * * *", // Default to 4 PM daily
    timezone: getUserTimezoneOrFallback(), // Default to user's timezone or closest match
    gitProviderId: "",
    repositories: [],
    messagingProviderId: "",
    messagingChannelId: "",
    escalationProviderId: "",
    escalationChannelId: "",
    escalationDays: 3,
    prFilters: {
      labels: [],
      titleKeywords: [],
    },
    sendWhenEmpty: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repositorySearchTerm, setRepositorySearchTerm] = useState("");
  const [selectedDiscordGuild, setSelectedDiscordGuild] = useState("");
  // Use SWR hooks for provider data
  const { providers: gitProviders, loading: loadingGitProviders } =
    useGitProviders();
  const { providers: messagingProviders, loading: loadingMessagingProviders } =
    useMessagingProviders();

  // Prefetch all repositories for connected providers
  const { repositoriesByProvider, loading: loadingAllRepositories } =
    usePrefetchRepositories(gitProviders, true);

  // Get channels for each connected messaging provider using individual useChannels calls
  const connectedMessagingProviders = messagingProviders.filter(
    (p) => p.connected
  );
  const channelResults = connectedMessagingProviders.map((provider) => {
    const { channels, loading, error } = useChannels(
      provider.id,
      provider.type,
      true
    );
    return { providerId: provider.id, channels, loading, error };
  });

  // Build channelsByProvider object and loading state
  type ChannelType =
    | SlackChannel
    | DiscordChannel
    | { id: string; name: string; type: string; isGuild?: boolean };
  const channelsByProvider = channelResults.reduce((acc, result) => {
    acc[result.providerId] = result.channels;
    return acc;
  }, {} as Record<string, ChannelType[]>);
  const loadingAllChannels = channelResults.some((result) => result.loading);

  // Get repositories and channels for currently selected providers
  const availableRepositories = formData.gitProviderId
    ? repositoriesByProvider[formData.gitProviderId] || []
    : [];

  // Get the selected messaging provider to determine its type
  const selectedMessagingProvider = messagingProviders.find(
    (p) => p.id === formData.messagingProviderId
  );
  const isDiscordProvider = selectedMessagingProvider?.type === "discord";

  // For Discord, get channels for the selected guild
  const { channels: discordChannels, loading: loadingDiscordChannels } =
    useDiscordChannels(
      selectedDiscordGuild,
      isDiscordProvider && !!selectedDiscordGuild
    );

  const availableChannels = formData.messagingProviderId
    ? isDiscordProvider
      ? discordChannels // Use Discord channels if guild is selected
      : channelsByProvider[formData.messagingProviderId] || []
    : [];

  // Filter repositories based on search term
  const filteredRepositories = availableRepositories.filter((repo) =>
    repo.toLowerCase().includes(repositorySearchTerm.toLowerCase())
  );

  // Loading states
  const loadingRepositories = loadingAllRepositories;
  const loadingChannels = isDiscordProvider
    ? loadingDiscordChannels
    : loadingAllChannels;

  const loadingProviders = loadingGitProviders || loadingMessagingProviders;

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  // Initialize form data if editing
  useEffect(() => {
    if (schedule) {
      const userTimezone = getUserTimezoneOrFallback();

      setFormData({
        name: schedule.name || "",
        cronExpression: schedule.cronExpression || "", // Keep as UTC, CronBuilder will handle display conversion
        timezone: userTimezone, // User's current timezone for display
        gitProviderId: schedule.gitProviderId || "",
        repositories: schedule.repositories || [],
        messagingProviderId: schedule.messagingProviderId || "",
        messagingChannelId: schedule.messagingChannelId || "",
        escalationProviderId: schedule.escalationProviderId || "",
        escalationChannelId: schedule.escalationChannelId || "",
        escalationDays: schedule.escalationDays || 3,
        prFilters: {
          labels: schedule.prFilters?.labels || [],
          titleKeywords: schedule.prFilters?.titleKeywords || [],
        },
        sendWhenEmpty: schedule.sendWhenEmpty || false,
      });
    }
  }, [schedule]);

  // Find the guild for the selected Discord channel when editing
  useEffect(() => {
    const findGuildForChannel = async () => {
      if (
        schedule &&
        schedule.messagingChannelId &&
        isDiscordProvider &&
        !selectedDiscordGuild &&
        !loadingAllChannels
      ) {
        // Get all guilds from channelsByProvider
        const guilds = channelsByProvider[formData.messagingProviderId] || [];

        // Search through each guild to find the one containing our channel
        for (const guild of guilds) {
          try {
            const response = await fetch(
              `/api/providers/messaging/discord/guilds/${guild.id}/channels`
            );
            if (response.ok) {
              const data = await response.json();
              const channels = data.data?.channels || [];

              // Check if this guild contains our target channel
              const channelExists = channels.some(
                (channel: DiscordChannel) =>
                  channel.id === schedule.messagingChannelId
              );

              if (channelExists) {
                setSelectedDiscordGuild(guild.id);
                break;
              }
            }
          } catch (error) {
            console.warn(
              `Failed to fetch channels for guild ${guild.id}:`,
              error
            );
          }
        }
      }
    };

    findGuildForChannel();
  }, [
    schedule,
    isDiscordProvider,
    selectedDiscordGuild,
    loadingAllChannels,
    channelsByProvider,
    formData.messagingProviderId,
  ]);

  // Auto-select first providers when creating a new schedule
  useEffect(() => {
    if (!schedule && !loadingProviders) {
      const connectedGitProviders = gitProviders.filter((p) => p.connected);
      const connectedMessagingProviders = messagingProviders.filter(
        (p) => p.connected
      );

      setFormData((prev) => ({
        ...prev,
        gitProviderId: prev.gitProviderId || connectedGitProviders[0]?.id || "",
        messagingProviderId:
          prev.messagingProviderId || connectedMessagingProviders[0]?.id || "",
      }));
    }
  }, [schedule, loadingProviders, gitProviders, messagingProviders]);

  const validateCronExpression = (expression: string): boolean => {
    try {
      // Validate as UTC since that's how it's stored
      CronExpressionParser.parse(expression, { tz: "UTC" });
      return true;
    } catch (error) {
      return false;
    }
  };

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Schedule name is required";
    }

    if (!formData.cronExpression.trim()) {
      newErrors.cronExpression = "Cron expression is required";
    } else if (!validateCronExpression(formData.cronExpression)) {
      newErrors.cronExpression = "Invalid cron expression format";
    }

    if (!formData.gitProviderId) {
      newErrors.gitProviderId = "Git provider is required";
    }

    if (!formData.repositories || formData.repositories.length === 0) {
      newErrors.repositories = "At least one repository is required";
    }

    if (!formData.messagingProviderId) {
      newErrors.messagingProviderId = "Messaging provider is required";
    }

    if (!formData.messagingChannelId) {
      newErrors.messagingChannelId = "Messaging channel is required";
    }

    if (formData.escalationProviderId && formData.escalationDays < 1) {
      newErrors.escalationDays = "Escalation days must be at least 1";
    }

    if (formData.escalationProviderId && !formData.escalationChannelId) {
      newErrors.escalationChannelId =
        "Escalation channel is required when escalation provider is selected";
    }

    return newErrors;
  };

  // Check if form has all required fields filled (for button state)
  const isFormValid = (): boolean => {
    return (
      formData.name.trim() !== "" &&
      formData.cronExpression.trim() !== "" &&
      validateCronExpression(formData.cronExpression) &&
      formData.gitProviderId !== "" &&
      formData.repositories.length > 0 &&
      formData.messagingProviderId !== "" &&
      formData.messagingChannelId !== "" &&
      (!formData.escalationProviderId ||
        (formData.escalationChannelId !== "" && formData.escalationDays >= 1))
    );
  };

  // Get validation summary for display near CTA
  const getValidationSummary = (): string[] => {
    const missing: string[] = [];

    if (!formData.name.trim()) missing.push("Schedule name");
    if (!formData.cronExpression.trim()) missing.push("Schedule timing");
    if (!formData.gitProviderId) missing.push("Git provider");
    if (!formData.repositories || formData.repositories.length === 0)
      missing.push("Repository selection");
    if (!formData.messagingProviderId) missing.push("Messaging provider");
    if (!formData.messagingChannelId) missing.push("Notification channel");
    if (formData.escalationProviderId && !formData.escalationChannelId)
      missing.push("Escalation channel");

    return missing;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare the data for API - cronExpression is already in UTC
      const apiData = {
        name: formData.name.trim(),
        cronExpression: formData.cronExpression.trim(), // Already in UTC from CronBuilder
        gitProviderId: formData.gitProviderId,
        repositories: formData.repositories,
        messagingProviderId: formData.messagingProviderId,
        messagingChannelId: formData.messagingChannelId,
        escalationProviderId: formData.escalationProviderId || undefined,
        escalationChannelId: formData.escalationProviderId
          ? formData.escalationChannelId
          : undefined,
        escalationDays: formData.escalationProviderId
          ? formData.escalationDays
          : undefined,
        prFilters: formData.prFilters,
        sendWhenEmpty: formData.sendWhenEmpty,
        isActive: true, // New schedules are active by default
      };

      let response;

      if (schedule) {
        // Update existing schedule
        response = await fetch(`/api/schedules/${schedule.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: schedule.id,
            ...apiData,
          }),
        });
      } else {
        // Create new schedule
        response = await fetch("/api/schedules", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to ${schedule ? "update" : "create"} schedule`
        );
      }

      // Close modal and refresh the schedules list
      onClose(true);
    } catch (error) {
      console.error("Failed to save cron job:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to save schedule. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div
        className="modal-content schedule-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <div className="schedule-icon">📅</div>
            <h2>{schedule ? "Edit Schedule" : "Create New Schedule"}</h2>
          </div>
          <button className="modal-close" onClick={() => onClose()}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="schedule-name">Schedule Name</label>
            <input
              id="schedule-name"
              type="text"
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="e.g., Critical PRs"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="form-section">
            <h3>Providers</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="git-provider">Git Provider</label>
                <select
                  id="git-provider"
                  className={`form-select ${
                    errors.gitProviderId ? "error" : ""
                  }`}
                  value={formData.gitProviderId}
                  onChange={(e) => {
                    const newGitProviderId = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      gitProviderId: newGitProviderId,
                      repositories: [], // Clear selected repositories when provider changes
                    }));
                  }}
                  disabled={loadingProviders}
                >
                  <option value="">
                    {loadingProviders ? "Loading..." : "Select Git Provider"}
                  </option>
                  {gitProviders
                    .filter((provider) => provider.connected)
                    .map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name} ({provider.provider})
                      </option>
                    ))}
                  {!loadingProviders &&
                    gitProviders.filter((p) => p.connected).length === 0 && (
                      <option value="" disabled>
                        No git providers connected
                      </option>
                    )}
                </select>
                {errors.gitProviderId && (
                  <div className="field-error">{errors.gitProviderId}</div>
                )}
              </div>

              {/* Repository Selection */}
              <div className="form-group">
                <label htmlFor="repositories">Repositories to Monitor</label>
                <div className="repository-selection">
                  {loadingRepositories && formData.gitProviderId ? (
                    <div className="loading-text">Loading repositories...</div>
                  ) : availableRepositories.length > 0 ? (
                    <>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search repositories..."
                        value={repositorySearchTerm}
                        onChange={(e) =>
                          setRepositorySearchTerm(e.target.value)
                        }
                        style={{ marginBottom: "8px" }}
                      />
                      <div
                        className="checkbox-group"
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          border: "1px solid #ddd",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        {filteredRepositories.map((repo) => (
                          <label key={repo} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.repositories.includes(repo)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    repositories: [...prev.repositories, repo],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    repositories: prev.repositories.filter(
                                      (r) => r !== repo
                                    ),
                                  }));
                                }
                              }}
                            />
                            {repo}
                          </label>
                        ))}
                        {filteredRepositories.length === 0 &&
                          repositorySearchTerm && (
                            <div className="no-repositories">
                              No repositories match your search
                            </div>
                          )}
                      </div>
                    </>
                  ) : formData.gitProviderId ? (
                    <div className="no-repositories">
                      No repositories found for this provider
                    </div>
                  ) : (
                    <div className="select-provider-first">
                      Select a git provider first
                    </div>
                  )}
                </div>
                {errors.repositories && (
                  <div className="field-error">{errors.repositories}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="messaging-provider">Messaging Provider</label>
                <select
                  id="messaging-provider"
                  className={`form-select ${
                    errors.messagingProviderId ? "error" : ""
                  }`}
                  value={formData.messagingProviderId}
                  onChange={(e) => {
                    const newMessagingProviderId = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      messagingProviderId: newMessagingProviderId,
                      messagingChannelId: "", // Clear selected channel when provider changes
                    }));
                    // Clear Discord guild selection when provider changes
                    setSelectedDiscordGuild("");
                  }}
                  disabled={loadingProviders}
                >
                  <option value="">
                    {loadingProviders
                      ? "Loading..."
                      : "Select Messaging Provider"}
                  </option>
                  {messagingProviders
                    .filter((provider) => provider.connected)
                    .map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  {!loadingProviders &&
                    messagingProviders.filter((p) => p.connected).length ===
                      0 && (
                      <option value="" disabled>
                        No messaging providers connected
                      </option>
                    )}
                </select>
                {errors.messagingProviderId && (
                  <div className="field-error">
                    {errors.messagingProviderId}
                  </div>
                )}
              </div>

              {/* Channel Selection */}
              <div className="form-group">
                <label htmlFor="messaging-channel">Notification Channel</label>
                <div className="channel-selection">
                  {!formData.messagingProviderId ? (
                    <div className="select-provider-first">
                      Select a messaging provider first
                    </div>
                  ) : isDiscordProvider ? (
                    // Discord: Guild → Channel selection
                    <div className="discord-selection">
                      {/* Guild Selection */}
                      <select
                        className="form-select"
                        value={selectedDiscordGuild}
                        onChange={(e) => {
                          setSelectedDiscordGuild(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            messagingChannelId: "", // Clear channel when guild changes
                          }));
                        }}
                        style={{ marginBottom: "8px" }}
                      >
                        <option value="">Select Discord Server</option>
                        {(
                          channelsByProvider[formData.messagingProviderId] || []
                        ).map((guild) => (
                          <option key={guild.id} value={guild.id}>
                            🏰 {guild.name}
                          </option>
                        ))}
                      </select>

                      {/* Channel Selection (only show if guild is selected) */}
                      {selectedDiscordGuild && (
                        <>
                          {loadingDiscordChannels ? (
                            <div className="loading-text">
                              Loading channels...
                            </div>
                          ) : availableChannels.length > 0 ? (
                            <select
                              id="messaging-channel"
                              className={`form-select ${
                                errors.messagingChannelId ? "error" : ""
                              }`}
                              value={formData.messagingChannelId}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  messagingChannelId: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select a channel</option>
                              {availableChannels.map((channel) => (
                                <option key={channel.id} value={channel.id}>
                                  # {channel.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="no-channels">
                              No channels found in this server
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    // Slack/Teams: Direct channel selection
                    <>
                      {loadingChannels ? (
                        <div className="loading-text">Loading channels...</div>
                      ) : availableChannels.length > 0 ? (
                        <select
                          id="messaging-channel"
                          className={`form-select ${
                            errors.messagingChannelId ? "error" : ""
                          }`}
                          value={formData.messagingChannelId}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              messagingChannelId: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select a channel</option>
                          {availableChannels.map((channel) => (
                            <option key={channel.id} value={channel.id}>
                              {channel.type === "private" ? "🔒" : "#"}{" "}
                              {channel.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="no-channels">
                          No channels found for this provider
                        </div>
                      )}
                    </>
                  )}
                </div>
                {errors.messagingChannelId && (
                  <div className="field-error">{errors.messagingChannelId}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Schedule</h3>
            <CronBuilder
              value={formData.cronExpression}
              onChange={(expression) =>
                setFormData((prev) => ({ ...prev, cronExpression: expression }))
              }
              error={errors.cronExpression}
              timezone={formData.timezone}
              onTimezoneChange={(timezone) =>
                setFormData((prev) => ({ ...prev, timezone }))
              }
            />
          </div>

          <div className="form-section">
            <h3>PR Filters</h3>
            <FilterBuilder
              value={formData.prFilters}
              onChange={(filters) =>
                setFormData((prev) => ({ ...prev, prFilters: filters }))
              }
            />
          </div>

          <div className="form-section">
            <h3>Escalation Settings</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="escalation-provider">Escalation Provider</label>
                <select
                  id="escalation-provider"
                  className="form-select"
                  value={formData.escalationProviderId}
                  onChange={(e) => {
                    const newEscalationProviderId = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      escalationProviderId: newEscalationProviderId,
                      escalationChannelId: "", // Clear selected channel when provider changes
                    }));
                  }}
                  disabled={loadingProviders}
                >
                  <option value="">No escalation</option>
                  {messagingProviders
                    .filter((provider) => provider.connected)
                    .map((provider) => (
                      <option
                        key={`escalation-${provider.id}`}
                        value={provider.id}
                      >
                        {provider.name}
                      </option>
                    ))}
                </select>
              </div>

              {formData.escalationProviderId && (
                <div className="form-group">
                  <label htmlFor="escalation-channel">Escalation Channel</label>
                  {/* For now, use the same channels as the main notification */}
                  {/* TODO: Could add separate guild selection for escalation if needed */}
                  <select
                    id="escalation-channel"
                    className={`form-select ${
                      errors.escalationChannelId ? "error" : ""
                    }`}
                    value={formData.escalationChannelId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        escalationChannelId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select escalation channel</option>
                    {availableChannels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.type === "private" ? "🔒" : "#"} {channel.name}
                      </option>
                    ))}
                  </select>
                  {errors.escalationChannelId && (
                    <div className="field-error">
                      {errors.escalationChannelId}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="escalation-days">Escalation Days</label>
                <input
                  id="escalation-days"
                  type="number"
                  className={`form-input ${
                    errors.escalationDays ? "error" : ""
                  }`}
                  min="1"
                  max="30"
                  value={formData.escalationDays}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      escalationDays: parseInt(e.target.value) || 3,
                    }))
                  }
                />
                {errors.escalationDays && (
                  <div className="field-error">{errors.escalationDays}</div>
                )}
              </div>
            </div>
            <small className="form-help">
              Send escalation notifications for PRs older than the specified
              number of days to a different channel
            </small>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.sendWhenEmpty}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sendWhenEmpty: e.target.checked,
                  }))
                }
              />
              Send notification even when no PRs are found
            </label>
          </div>
        </div>

        <div className="modal-footer">
          {errors.submit && (
            <div className="modal-footer-error">
              <div className="error-message">{errors.submit}</div>
            </div>
          )}

          {/* Show validation summary if form is invalid and not currently submitting */}
          {!isFormValid() && !isSubmitting && (
            <div className="modal-footer-validation">
              <div className="validation-summary">
                <span className="validation-icon">⚠️</span>
                <span className="validation-text">
                  Please complete: {getValidationSummary().join(", ")}
                </span>
              </div>
            </div>
          )}

          <div className="modal-footer-buttons">
            <button
              className="cancel-button"
              onClick={() => onClose()}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="save-button"
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
              title={
                isSubmitting
                  ? "Saving schedule..."
                  : !isFormValid()
                  ? `Complete required fields: ${getValidationSummary().join(
                      ", "
                    )}`
                  : schedule
                  ? "Update this schedule"
                  : "Create new schedule"
              }
            >
              {isSubmitting
                ? "Saving..."
                : schedule
                ? "Update Schedule"
                : "Create Schedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
