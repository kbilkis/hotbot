import cronstrue from "cronstrue";
import React from "react";

interface CronBuilderProps {
  value: string;
  onChange: (expression: string) => void;
  error?: string;
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
}: CronBuilderProps): React.ReactElement {
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

  const cronParts = parseCronExpression(value);

  const updateCronPart = (field: keyof CronParts, newValue: string) => {
    const newParts = { ...cronParts, [field]: newValue };
    onChange(buildCronExpression(newParts));
  };

  const getCronDescription = (expression: string): string => {
    try {
      return cronstrue.toString(expression);
    } catch (error) {
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

  return (
    <div className="cron-builder">
      <div className="cron-presets">
        <label>Quick Presets</label>
        <div className="preset-buttons">
          {presetSchedules.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`preset-button ${
                value === preset.value ? "active" : ""
              }`}
              onClick={() => onChange(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cron-builder-grid">
        <div className="form-group">
          <label>Minute</label>
          <select
            className="form-select"
            value={cronParts.minute}
            onChange={(e) => updateCronPart("minute", e.target.value)}
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

        <div className="form-group">
          <label>Hour</label>
          <select
            className="form-select"
            value={cronParts.hour}
            onChange={(e) => updateCronPart("hour", e.target.value)}
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

        <div className="form-group">
          <label>Day of Week</label>
          <select
            className="form-select"
            value={cronParts.dayOfWeek}
            onChange={(e) => updateCronPart("dayOfWeek", e.target.value)}
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

      <div className="form-group">
        <label htmlFor="cron-expression">Cron Expression</label>
        <input
          id="cron-expression"
          type="text"
          className={`form-input ${error ? "error" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0 9 * * 1-5"
        />
        <small className="form-help">{getCronDescription(value)}</small>
        {error && <div className="field-error">{error}</div>}
      </div>
    </div>
  );
}
