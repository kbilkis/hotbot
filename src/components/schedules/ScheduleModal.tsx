import CronExpressionParser from "cron-parser";
import { useState, useEffect } from "preact/hooks";

import { useChannels, useDiscordChannels } from "@/hooks/useChannels";
import { useGitProviders } from "@/hooks/useGitProviders";
import { useMessagingProviders } from "@/hooks/useMessagingProviders";
import { useRepositories } from "@/hooks/useRepositories";
import { discordApi, schedulesApi } from "@/lib/api/client";
import { CronJob } from "@/lib/database/schema";
import { DiscordChannel } from "@/lib/discord";
import { getUserTimezoneOrFallback } from "@/lib/utils/timezone";
import * as formStyles from "@/styles/schedules/forms.css";
import * as styles from "@/styles/schedules/modal.css";
import { button } from "@/styles/theme/index.css";
import { SlackChannel } from "@/types/slack";

import CronBuilder from "./CronBuilder";
import FilterBuilder from "./FilterBuilder";

interface ScheduleModalProps {
  onClose: (shouldRefresh?: boolean) => void;
  schedule?: CronJob;
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
}: ScheduleModalProps) {
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
    useRepositories(gitProviders, true);

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
            const response = await discordApi.guilds[":guildId"].channels.$get({
              param: {
                guildId: guild.id,
              },
            });

            const data = await response.json();
            if (data.success) {
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
    } catch {
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
        response = await schedulesApi[":id"].$put({
          param: {
            id: schedule.id,
          },
          json: {
            id: schedule.id,
            ...apiData,
          },
        });
      } else {
        // Create new schedul
        response = await schedulesApi.$post({
          json: apiData,
        });
      }

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message ||
          data.error ||
          `Failed to ${schedule ? "update" : "create"} schedule`;
        throw new Error(errorMessage);
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
    <div className={styles.modalOverlay} onClick={() => onClose()}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWithIcon}>
            <div className={styles.scheduleIcon}>📅</div>
            <h2 className={styles.modalTitle}>
              {schedule ? "Edit Schedule" : "Create New Schedule"}
            </h2>
          </div>
          <button className={styles.modalClose} onClick={() => onClose()}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={formStyles.formGroup}>
            <label htmlFor="schedule-name" className={formStyles.formLabel}>
              Schedule Name
            </label>
            <input
              id="schedule-name"
              type="text"
              className={
                errors.name ? formStyles.formInputError : formStyles.formInput
              }
              placeholder="e.g., Critical PRs"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.currentTarget.value,
                }))
              }
            />
            {errors.name && (
              <div className={formStyles.fieldError}>{errors.name}</div>
            )}
          </div>

          <div className={formStyles.formSection}>
            <h3 className={formStyles.formSectionTitle}>Providers</h3>
            <div className={formStyles.formRow}>
              <div className={formStyles.formGroup}>
                <label htmlFor="git-provider">Git Provider</label>
                <select
                  id="git-provider"
                  className={`${formStyles.formSelect} ${
                    errors.gitProviderId ? formStyles.fieldError : ""
                  }`}
                  value={formData.gitProviderId}
                  onChange={(e) => {
                    const newGitProviderId = e.currentTarget.value;
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
                  <div className={formStyles.fieldError}>
                    {errors.gitProviderId}
                  </div>
                )}
              </div>

              {/* Repository Selection */}
              <div className={formStyles.formGroup}>
                <label htmlFor="repositories">Repositories to Monitor</label>
                <div className={formStyles.repositorySelection}>
                  {loadingRepositories && formData.gitProviderId ? (
                    <div className={formStyles.loadingText}>
                      Loading repositories...
                    </div>
                  ) : availableRepositories.length > 0 ? (
                    <>
                      <input
                        type="text"
                        className={formStyles.formInput}
                        placeholder="Search repositories..."
                        value={repositorySearchTerm}
                        onChange={(e) =>
                          setRepositorySearchTerm(e.currentTarget.value)
                        }
                        style={{ marginBottom: "8px" }}
                      />
                      <div className={formStyles.checkboxGroup}>
                        {filteredRepositories.map((repo) => (
                          <label
                            key={repo}
                            className={formStyles.checkboxLabel}
                          >
                            <input
                              type="checkbox"
                              checked={formData.repositories.includes(repo)}
                              onChange={(e) => {
                                if (e.currentTarget.checked) {
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
                            <div className={formStyles.noRepositories}>
                              No repositories match your search
                            </div>
                          )}
                      </div>
                    </>
                  ) : formData.gitProviderId ? (
                    <div className={formStyles.noRepositories}>
                      No repositories found for this provider
                    </div>
                  ) : (
                    <div className={formStyles.selectProviderFirst}>
                      Select a git provider first
                    </div>
                  )}
                </div>
                {errors.repositories && (
                  <div className={formStyles.fieldError}>
                    {errors.repositories}
                  </div>
                )}
              </div>
              <div className={formStyles.formGroup}>
                <label htmlFor="messaging-provider">Messaging Provider</label>
                <select
                  id="messaging-provider"
                  className={`${formStyles.formSelect} ${
                    errors.messagingProviderId ? formStyles.fieldError : ""
                  }`}
                  value={formData.messagingProviderId}
                  onChange={(e) => {
                    const newMessagingProviderId = e.currentTarget.value;
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
                  <div className={formStyles.fieldError}>
                    {errors.messagingProviderId}
                  </div>
                )}
              </div>

              {/* Channel Selection */}
              <div className={formStyles.formGroup}>
                <label htmlFor="messaging-channel">Notification Channel</label>
                <div className={formStyles.channelSelection}>
                  {!formData.messagingProviderId ? (
                    <div className={formStyles.selectProviderFirst}>
                      Select a messaging provider first
                    </div>
                  ) : isDiscordProvider ? (
                    // Discord: Guild → Channel selection
                    <div className={formStyles.discordSelection}>
                      {/* Guild Selection */}
                      <select
                        className={formStyles.formSelect}
                        value={selectedDiscordGuild}
                        onChange={(e) => {
                          setSelectedDiscordGuild(e.currentTarget.value);
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
                            <div className={formStyles.loadingText}>
                              Loading channels...
                            </div>
                          ) : availableChannels.length > 0 ? (
                            <select
                              id="messaging-channel"
                              className={`${formStyles.formSelect} ${
                                errors.messagingChannelId
                                  ? formStyles.fieldError
                                  : ""
                              }`}
                              value={formData.messagingChannelId}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  messagingChannelId: e.currentTarget.value,
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
                            <div className={formStyles.noChannels}>
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
                        <div className={formStyles.loadingText}>
                          Loading channels...
                        </div>
                      ) : availableChannels.length > 0 ? (
                        <select
                          id="messaging-channel"
                          className={`${formStyles.formSelect} ${
                            errors.messagingChannelId
                              ? formStyles.fieldError
                              : ""
                          }`}
                          value={formData.messagingChannelId}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              messagingChannelId: e.currentTarget.value,
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
                        <div className={formStyles.noChannels}>
                          No channels found for this provider
                        </div>
                      )}
                    </>
                  )}
                </div>
                {errors.messagingChannelId && (
                  <div className={formStyles.fieldError}>
                    {errors.messagingChannelId}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={formStyles.formSection}>
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

          <div className={formStyles.formSection}>
            <h3>PR Filters</h3>
            <FilterBuilder
              value={formData.prFilters}
              onChange={(filters) =>
                setFormData((prev) => ({ ...prev, prFilters: filters }))
              }
            />
          </div>

          <div className={formStyles.formSection}>
            <h3>Escalation Settings</h3>
            <div className={formStyles.formRow}>
              <div className={formStyles.formGroup}>
                <label htmlFor="escalation-provider">Escalation Provider</label>
                <select
                  id="escalation-provider"
                  className={formStyles.formSelect}
                  value={formData.escalationProviderId}
                  onChange={(e) => {
                    const newEscalationProviderId = e.currentTarget.value;
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
                <div className={formStyles.formGroup}>
                  <label htmlFor="escalation-channel">Escalation Channel</label>
                  {/* For now, use the same channels as the main notification */}
                  {/* TODO: Could add separate guild selection for escalation if needed */}
                  <select
                    id="escalation-channel"
                    className={`${formStyles.formSelect} ${
                      errors.escalationChannelId ? formStyles.fieldError : ""
                    }`}
                    value={formData.escalationChannelId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        escalationChannelId: e.currentTarget.value,
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
                    <div className={formStyles.fieldError}>
                      {errors.escalationChannelId}
                    </div>
                  )}
                </div>
              )}

              <div className={formStyles.formGroup}>
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
                      escalationDays: parseInt(e.currentTarget.value) || 3,
                    }))
                  }
                />
                {errors.escalationDays && (
                  <div className={formStyles.fieldError}>
                    {errors.escalationDays}
                  </div>
                )}
              </div>
            </div>
            <small className={formStyles.formHelp}>
              Send escalation notifications for PRs older than the specified
              number of days to a different channel
            </small>
          </div>

          <div className={formStyles.formGroup}>
            <label className={formStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.sendWhenEmpty}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sendWhenEmpty: e.currentTarget.checked,
                  }))
                }
              />
              Send notification even when no PRs are found
            </label>
          </div>
        </div>

        <div className={styles.modalFooter}>
          {errors.submit && (
            <div className={formStyles.fieldError}>{errors.submit}</div>
          )}

          {/* Show validation summary if form is invalid and not currently submitting */}
          {!isFormValid() && !isSubmitting && (
            <div className={formStyles.fieldError}>
              ⚠️ Please complete: {getValidationSummary().join(", ")}
            </div>
          )}

          <div>
            <button
              className={button({ color: "outline" })}
              onClick={() => onClose()}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className={button({ color: "primary" })}
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
