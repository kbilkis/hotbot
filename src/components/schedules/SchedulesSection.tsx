import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";
import React, { useState } from "react";

import { useSchedules } from "../../hooks/useSchedules";
import { CronJob } from "../../types/dashboard";

import ScheduleModal from "./ScheduleModal";

const calculateNextExecution = (cronExpression: string): string | undefined => {
  try {
    const interval = CronExpressionParser.parse(cronExpression);
    return interval.next().toDate().toLocaleString();
  } catch (error) {
    console.error("Error calculating next execution:", error);
    return undefined;
  }
};

const getCronDescription = (cronExpression: string): string => {
  try {
    return cronstrue.toString(cronExpression);
  } catch (error) {
    return cronExpression; // Fallback to raw expression if cronstrue fails
  }
};

export default function SchedulesSection(): React.ReactElement {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CronJob | null>(null);

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
    try {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const newActiveState = schedule.status !== "active";

      const response = await fetch("/api/schedules/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: scheduleId,
          isActive: newActiveState,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "paused":
        return "status-paused";
      case "error":
        return "status-error";
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
              <div>Last Run</div>
              <div>Next Run</div>
              <div>Actions</div>
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
                <div>
                  <div className="schedule-name">{schedule.name}</div>
                  <div className="schedule-details">
                    {schedule.repositories.length} repositories
                  </div>
                </div>
                <div className="schedule-description">
                  <div className="cron-description">
                    {getCronDescription(schedule.cronExpression)}
                  </div>
                  <div className="cron-expression">
                    {schedule.cronExpression}
                  </div>
                </div>
                <div>{schedule.lastRun || "-"}</div>
                <div className="next-run-time">
                  {schedule.status === "active"
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
                      ✏️
                    </button>
                    <button
                      className={`toggle-button ${
                        schedule.status === "paused" ? "paused" : ""
                      }`}
                      onClick={() => handleToggleSchedule(schedule.id)}
                      title={
                        schedule.status === "active"
                          ? "Pause schedule"
                          : "Resume schedule"
                      }
                    >
                      {schedule.status === "active" ? "⏸️" : "▶️"}
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      title="Delete schedule"
                    >
                      🗑️
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
