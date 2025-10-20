import { useState } from "preact/hooks";

import { useSchedules } from "@/hooks/useSchedules";
import { schedulesApi } from "@/lib/api/client";
import { CronJob } from "@/lib/database/schema";
import * as styles from "@/styles/dashboard/schedules.css";
import * as layoutStyles from "@/styles/layout/layout.css";
import { button } from "@/styles/theme/index.css";

import ScheduleModal from "./ScheduleModal";
import SchedulesTable from "./SchedulesTable";

export default function SchedulesSection() {
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
      const response = await schedulesApi[":id"].$delete({
        param: {
          id: scheduleId,
        },
      });
      const data = await response.json();

      if (!data.success) {
        const errorMessage =
          data.message || data.error || "Failed to delete schedule";
        throw new Error(errorMessage);
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

      const response = await schedulesApi.toggle.$post({
        json: {
          id: scheduleId,
          isActive: !schedule.isActive,
        },
      });

      const data = await response.json();
      if (!data.success) {
        const errorMessage =
          data.message || data.error || "Failed to toggle schedule";
        throw new Error(errorMessage);
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

  if (loading) {
    return (
      <div className={layoutStyles.section}>
        <div className={layoutStyles.sectionHeader}>
          <div className={layoutStyles.sectionContent}>
            <h1 className={layoutStyles.sectionTitle}>Schedules</h1>
            <p className={layoutStyles.sectionDescription}>
              Manage your notification schedules and create new ones.
            </p>
          </div>
        </div>
        <div className={styles.schedulesSection}>
          <div className={styles.loadingSection}>
            <p>Loading schedules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={layoutStyles.section}>
        <div className={layoutStyles.sectionHeader}>
          <div className={layoutStyles.sectionContent}>
            <h1 className={layoutStyles.sectionTitle}>Schedules</h1>
            <p className={layoutStyles.sectionDescription}>
              Manage your notification schedules and create new ones.
            </p>
          </div>
        </div>
        <div className={styles.schedulesSection}>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={layoutStyles.section}>
      <div className={layoutStyles.sectionHeader}>
        <div className={layoutStyles.sectionContent}>
          <h1 className={layoutStyles.sectionTitle}>Schedules</h1>
          <p className={layoutStyles.sectionDescription}>
            Manage your notification schedules and create new ones.
          </p>
        </div>
        <button
          className={button({ color: "primary" })}
          onClick={handleCreateSchedule}
        >
          + Create Schedule
        </button>
      </div>

      <div className={styles.schedulesSection}>
        <SchedulesTable
          schedules={schedules}
          onEdit={handleEditSchedule}
          onDelete={handleDeleteSchedule}
          onToggle={handleToggleSchedule}
          togglingScheduleId={togglingScheduleId}
        />
      </div>

      {showScheduleModal && (
        <ScheduleModal
          onClose={handleCloseModal}
          scheduleToEdit={editingSchedule || undefined}
        />
      )}
    </div>
  );
}
