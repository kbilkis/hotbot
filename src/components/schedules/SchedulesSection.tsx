import {
  PencilSquareIcon,
  PlayIcon,
  PauseCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CronExpressionParser } from "cron-parser";
import React, { useState } from "react";

import { CronJob } from "@/lib/database/schema";

import { useSchedules } from "../../hooks/useSchedules";

import ScheduleModal from "./ScheduleModal";

const calculateNextExecution = (
  utcCronExpression: string
): string | undefined => {
  try {
    // Parse as UTC since that's how it's stored
    const interval = CronExpressionParser.parse(utcCronExpression, {
      tz: "UTC",
    });
    const nextRun = interval.next().toDate();

    // Format in user's local timezone for better UX
    const date = nextRun.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZoneName: "short",
    });

    const time = nextRun.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${date}, ${time}`;
  } catch (error) {
    console.error("Error calculating next execution:", error);
    return undefined;
  }
};

export default function SchedulesSection(): React.ReactElement {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CronJob | null>(null);
  const [togglingScheduleId, setTogglingScheduleId] = useState<string | null>(
    null
  );

  // Use SWR hook for schedules data
  const { schedules, loading, error, refetch } = useSchedules();

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule: CronJob) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete schedule: ${response.statusText}`);
      }

      // Refetch data using SWR
      refetch();
    } catch (err) {
      console.error("Failed to delete schedule:", err);
      alert("Failed to delete schedule");
    }
  };

  const handleToggleSchedule = async (scheduleId: string) => {
    if (togglingScheduleId) return; // Prevent multiple simultaneous toggles

    try {
      setTogglingScheduleId(scheduleId);

      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const response = await fetch("/api/schedules/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: scheduleId,
          isActive: !schedule.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle schedule: ${response.statusText}`);
      }

      // Refetch data using SWR
      refetch();
    } catch (err) {
      console.error("Failed to toggle schedule:", err);
      alert("Failed to toggle schedule");
    } finally {
      setTogglingScheduleId(null);
    }
  };

  const handleCloseModal = (shouldRefresh = false) => {
    setShowScheduleModal(false);
    setEditingSchedule(null);

    // Refresh schedules if a schedule was created or updated
    if (shouldRefresh) {
      refetch();
    }
  };

  const getStatusColor = (isActive: boolean) => {
    if (isActive) {
      return "status-active";
    }
    return "status-paused";
  };

  const getStatusDot = (isActive: boolean) => {
    if (isActive) {
      return "bg-green-500";
    } else {
      return "bg-yellow-500";
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="section-header">
          <div className="section-content">
            <h1>Schedules</h1>
            <p>Manage your notification schedules and create new ones.</p>
          </div>
        </div>
        <div className="schedules-section">
          <div className="loading-section">
            <p>Loading schedules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="section-header">
          <div className="section-content">
            <h1>Schedules</h1>
            <p>Manage your notification schedules and create new ones.</p>
          </div>
        </div>
        <div className="schedules-section">
          <div className="error-message">
            {error}
            <button
              onClick={() => refetch()}
              className="retry-button"
              style={{ marginLeft: "10px" }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-content">
          <h1>Schedules</h1>
          <p>Manage your notification schedules and create new ones.</p>
        </div>
        <button
          className="create-schedule-button"
          onClick={handleCreateSchedule}
        >
          + Create Schedule
        </button>
      </div>

      <div className="schedules-section">
        {schedules.length === 0 ? (
          <div className="empty-state">
            <p>
              No schedules created yet. Create your first schedule to get
              started.
            </p>
          </div>
        ) : (
          <div className="schedules-table">
            <div className="table-header">
              <div>Status</div>
              <div>Name</div>
              <div>Schedule</div>
              <div>Next Run</div>
              <div>Actions</div>
            </div>
            {schedules.map((schedule) => (
              <div key={schedule.id} className="table-row">
                <div className="status-cell">
                  <div
                    className={`status-dot ${getStatusDot(
                      !!schedule.isActive
                    )}`}
                  ></div>
                  <span className={getStatusColor(!!schedule.isActive)}>
                    {schedule.isActive ? "Active" : "Paused"}
                  </span>
                </div>
                <div>
                  <div className="schedule-name">{schedule.name}</div>
                  <div className="schedule-details">
                    {schedule.repositories.length} repositories
                  </div>
                </div>
                <div className="schedule-description">
                  <div>
                    {schedule.cronExpression}{" "}
                    <span className="schedule-utc0">(UTC+0)</span>
                  </div>
                </div>
                <div className="next-run-time">
                  {schedule.isActive
                    ? calculateNextExecution(schedule.cronExpression) || "-"
                    : "-"}
                </div>
                <div className="actions-cell">
                  <div className="schedule-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditSchedule(schedule)}
                      title="Edit schedule"
                    >
                      <PencilSquareIcon className="schedule-action-icon" />
                    </button>
                    <button
                      className={`toggle-button ${
                        schedule.isActive ? "" : "paused"
                      } ${togglingScheduleId === schedule.id ? "loading" : ""}`}
                      onClick={() => handleToggleSchedule(schedule.id)}
                      disabled={togglingScheduleId === schedule.id}
                      title={
                        togglingScheduleId === schedule.id
                          ? "Processing..."
                          : schedule.isActive
                          ? "Pause schedule"
                          : "Resume schedule"
                      }
                    >
                      {togglingScheduleId === schedule.id ? (
                        <div className="loading-spinner-button" />
                      ) : schedule.isActive ? (
                        <PauseCircleIcon className="schedule-action-icon" />
                      ) : (
                        <PlayIcon className="schedule-action-icon" />
                      )}
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      title="Delete schedule"
                    >
                      <TrashIcon className="schedule-action-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showScheduleModal && (
        <ScheduleModal
          onClose={handleCloseModal}
          schedule={editingSchedule || undefined}
        />
      )}
    </div>
  );
}
