import React, { useState } from "react";
import ScheduleModal from "./ScheduleModal";
import { Schedule } from "../../types/dashboard";

export default function SchedulesSection(): React.ReactElement {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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

      {showScheduleModal && (
        <ScheduleModal onClose={() => setShowScheduleModal(false)} />
      )}
    </div>
  );
}
