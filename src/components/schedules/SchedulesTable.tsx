import { CronJob } from "@/lib/database/schema";

import * as styles from "../../styles/dashboard/schedules.css";

import ScheduleTableRow from "./ScheduleTableRow";

interface SchedulesTableProps {
  schedules: CronJob[];
  onEdit: (schedule: CronJob) => void;
  onDelete: (scheduleId: string) => void;
  onToggle: (scheduleId: string) => void;
  togglingScheduleId: string | null;
}

export default function SchedulesTable({
  schedules,
  onEdit,
  onDelete,
  onToggle,
  togglingScheduleId,
}: SchedulesTableProps) {
  if (schedules.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>
          No schedules created yet. Create your first schedule to get started.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.schedulesTable}>
      <div className={styles.tableHeader}>
        <div>Status</div>
        <div>Name</div>
        <div>Schedule</div>
        <div>Next Run</div>
        <div>Actions</div>
      </div>
      {schedules.map((schedule) => (
        <ScheduleTableRow
          key={schedule.id}
          schedule={schedule}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
          togglingScheduleId={togglingScheduleId}
        />
      ))}
    </div>
  );
}
