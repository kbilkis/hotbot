import cronstrue from "cronstrue";

import {
  getUserTimezoneOrFallback,
  getAllTimezones,
  convertCronToUTC,
  convertCronFromUTC,
} from "@/lib/utils/timezone";
import * as styles from "@/styles/schedules/cron-builder.css";
import { button } from "@/styles/theme/index.css";

import Tooltip from "../ui/Tooltip";

interface CronBuilderProps {
  value: string; // This is always the UTC cron expression
  onChange: (expression: string) => void; // This always sends UTC cron expression
  error?: string;
  timezone?: string;
  onTimezoneChange?: (timezone: string) => void;
}

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export default function CronBuilder({
  value,
  onChange,
  error,
  timezone = "UTC",
  onTimezoneChange,
}: Readonly<CronBuilderProps>) {
  // Convert UTC cron expression to display timezone for editing
  const getDisplayCronExpression = (utcCron: string): string => {
    if (!utcCron || timezone === "UTC+0") return utcCron;
    try {
      return convertCronFromUTC(utcCron, timezone);
    } catch (error) {
      console.warn("Failed to convert cron from UTC for display:", error);
      return utcCron;
    }
  };

  // Convert display cron expression back to UTC for storage
  const convertToUTCAndNotify = (displayCron: string): void => {
    if (!displayCron) {
      onChange("");
      return;
    }

    if (timezone === "UTC+0") {
      onChange(displayCron);
      return;
    }

    try {
      const utcCron = convertCronToUTC(displayCron, timezone);
      onChange(utcCron);
    } catch (error) {
      console.warn("Failed to convert cron to UTC:", error);
      onChange(displayCron); // Fallback to original
    }
  };

  const parseCronExpression = (expression: string): CronParts => {
    const parts = expression.split(" ");
    if (parts.length !== 5) {
      return {
        minute: "*",
        hour: "*",
        dayOfMonth: "*",
        month: "*",
        dayOfWeek: "*",
      };
    }
    return {
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    };
  };

  const buildCronExpression = (parts: CronParts): string => {
    return `${parts.minute} ${parts.hour} ${parts.dayOfMonth} ${parts.month} ${parts.dayOfWeek}`;
  };

  // Work with display cron expression (in user's timezone)
  const displayCronExpression = getDisplayCronExpression(value);
  const cronParts = parseCronExpression(displayCronExpression);

  const updateCronPart = (field: keyof CronParts, newValue: string) => {
    const newParts = { ...cronParts, [field]: newValue };
    const newDisplayCron = buildCronExpression(newParts);
    convertToUTCAndNotify(newDisplayCron);
  };

  const getCronDescription = (expression: string): string => {
    try {
      // Show description for the display cron expression (in user's timezone)
      const description = cronstrue.toString(
        displayCronExpression || expression,
        { use24HourTimeFormat: true }
      );
      return `${description} (${timezone})`;
    } catch {
      return "Invalid cron expression";
    }
  };

  const presetSchedules = [
    { label: "Every 15 minutes", value: "*/15 * * * *" },
    { label: "Every hour", value: "0 * * * *" },
    { label: "Daily at 9 AM", value: "0 9 * * *" },
    { label: "Weekdays at 9 AM", value: "0 9 * * 1-5" },
    { label: "Weekly on Monday at 9 AM", value: "0 9 * * 1" },
    { label: "Monthly on 1st at 9 AM", value: "0 9 1 * *" },
  ];

  const handlePresetClick = (presetValue: string) => {
    // Preset values are in display timezone, convert to UTC
    convertToUTCAndNotify(presetValue);
  };

  return (
    <div className={styles.cronBuilder}>
      <div className={styles.cronPresets}>
        <div className={styles.cronLabel}>Quick Presets</div>
        <div className={styles.presetButtons}>
          {presetSchedules.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={button({
                color: "ghost",
                size: "sm",
                alternative: true,
              })}
              onClick={() => handlePresetClick(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.cronBuilderGrid}>
        <div className={styles.cronField}>
          <div className={styles.cronLabel}>Minute</div>
          <select
            className={styles.cronSelect}
            value={cronParts.minute}
            onChange={(e) => updateCronPart("minute", e.currentTarget.value)}
          >
            <option value="*">Every minute</option>
            <option value="0">:00</option>
            <option value="15">:15</option>
            <option value="30">:30</option>
            <option value="45">:45</option>
            <option value="*/5">Every 5 minutes</option>
            <option value="*/15">Every 15 minutes</option>
            <option value="*/30">Every 30 minutes</option>
          </select>
        </div>

        <div className={styles.cronField}>
          <div className={styles.cronLabel}>Hour</div>
          <select
            className={styles.cronSelect}
            value={cronParts.hour}
            onChange={(e) => updateCronPart("hour", e.currentTarget.value)}
          >
            <option value="*">Every hour</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i.toString()}>
                {i.toString().padStart(2, "0")}:00
              </option>
            ))}
            <option value="*/2">Every 2 hours</option>
            <option value="*/4">Every 4 hours</option>
            <option value="*/6">Every 6 hours</option>
            <option value="*/12">Every 12 hours</option>
          </select>
        </div>

        <div className={styles.cronField}>
          <div className={styles.cronLabel}>Day of Week</div>
          <select
            className={styles.cronSelect}
            value={cronParts.dayOfWeek}
            onChange={(e) => updateCronPart("dayOfWeek", e.currentTarget.value)}
          >
            <option value="*">Every day</option>
            <option value="1-5">Weekdays (Mon-Fri)</option>
            <option value="6,0">Weekends (Sat-Sun)</option>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
            <option value="0">Sunday</option>
          </select>
        </div>
      </div>

      {onTimezoneChange && (
        <div className={styles.timezoneSection}>
          <label htmlFor="timezone" className={styles.timezoneLabel}>
            Timezone{" "}
            <Tooltip text="Schedule will run at the specified time in this timezone" />
          </label>
          <select
            id="timezone"
            className={styles.timezoneSelect}
            value={timezone || getUserTimezoneOrFallback()}
            onChange={(e) => onTimezoneChange(e.currentTarget.value)}
          >
            {getAllTimezones().map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.cronExpression}>
        <label htmlFor="cron-expression" className={styles.cronExpressionLabel}>
          Cron Expression{" "}
          <span className={styles.scheduleUtc}>
            (UTC format - no timezone conversion)
          </span>
        </label>
        <input
          id="cron-expression"
          type="text"
          className={error ? styles.cronInputError : styles.cronInput}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="0 9 * * 1-5"
        />
        <small className={styles.cronDescription}>
          {getCronDescription(value)}
        </small>
        {error && <div className={styles.fieldError}>{error}</div>}
      </div>
    </div>
  );
}
