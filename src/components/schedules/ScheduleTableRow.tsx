import {
  PencilSquareIcon,
  PlayIcon,
  PauseCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CronExpressionParser } from "cron-parser";

import { CronJob } from "@/lib/database/schema";
import * as styles from "@/styles/dashboard/schedules.css";

interface ScheduleTableRowProps {
  schedule: CronJob;
  onEdit: (schedule: CronJob) => void;
  onDelete: (scheduleId: string) => void;
  onToggle: (scheduleId: string) => void;
  togglingScheduleId: string | null;
}

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

export default function ScheduleTableRow({
  schedule,
  onEdit,
  onDelete,
  onToggle,
  togglingScheduleId,
}: Readonly<ScheduleTableRowProps>) {
  const isToggling = togglingScheduleId === schedule.id;

  return (
    <div className={styles.tableRow}>
      <div className={styles.statusCell}>
        <div
          className={
            schedule.isActive ? styles.statusDotActive : styles.statusDotPaused
          }
        ></div>
        <span
          className={
            schedule.isActive ? styles.statusActive : styles.statusPaused
          }
        >
          {schedule.isActive ? "Active" : "Paused"}
        </span>
      </div>
      <div>
        <div className={styles.scheduleName}>{schedule.name}</div>
        <div className={styles.scheduleDetails}>
          {schedule.repositories.length} repositories
        </div>
      </div>
      <div className={styles.scheduleDescription}>
        <div>
          {schedule.cronExpression}{" "}
          <span className={styles.scheduleUtc}>(UTC+0)</span>
        </div>
      </div>
      <div className={styles.nextRunTime}>
        {schedule.isActive
          ? calculateNextExecution(schedule.cronExpression) || "-"
          : "-"}
      </div>
      <div className={styles.actionsCell}>
        <div className={styles.scheduleActions}>
          <button
            className={styles.editButton}
            onClick={() => onEdit(schedule)}
            title="Edit schedule"
          >
            <PencilSquareIcon className={styles.scheduleActionIcon} />
          </button>
          <button
            className={
              schedule.isActive
                ? styles.toggleButton
                : styles.toggleButtonPaused
            }
            onClick={() => onToggle(schedule.id)}
            disabled={isToggling}
            title={
              isToggling
                ? "Processing..."
                : schedule.isActive
                ? "Pause schedule"
                : "Resume schedule"
            }
          >
            {isToggling ? (
              <div className={styles.loadingSpinnerButton} />
            ) : schedule.isActive ? (
              <PauseCircleIcon className={styles.scheduleActionIcon} />
            ) : (
              <PlayIcon className={styles.scheduleActionIcon} />
            )}
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(schedule.id)}
            title="Delete schedule"
          >
            <TrashIcon className={styles.scheduleActionIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}
