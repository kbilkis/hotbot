/**
 * Timezone utilities for cron expression conversion
 */

/**
 * Get the user's timezone as a UTC offset string
 */
export function getUserTimezoneOrFallback(): string {
  try {
    const now = new Date();
    const userOffset = -now.getTimezoneOffset() / 60; // Convert to hours, invert sign

    // Handle special case for India/Sri Lanka (UTC+5:30)
    if (userOffset === 5.5) {
      return "UTC+5:30";
    }

    // Format as UTC offset
    if (userOffset === 0) {
      return "UTC+0";
    } else if (userOffset > 0) {
      return `UTC+${userOffset}`;
    } else {
      return `UTC${userOffset}`; // userOffset is already negative
    }
  } catch {
    // Fallback to UTC if all else fails
    return "UTC+0";
  }
}

/**
 * Get a comprehensive list of UTC offset timezones for the timezone selector
 * Includes all UTC offsets with representative locations
 */
export function getAllTimezones(): Array<{ value: string; label: string }> {
  return [
    // UTC-12 to UTC-1
    { value: "UTC-12", label: "UTC-12 (Baker Island)" },
    { value: "UTC-11", label: "UTC-11 (Samoa)" },
    { value: "UTC-10", label: "UTC-10 (Hawaii)" },
    { value: "UTC-9", label: "UTC-9 (Alaska)" },
    { value: "UTC-8", label: "UTC-8 (Pacific Time)" },
    { value: "UTC-7", label: "UTC-7 (Mountain Time)" },
    { value: "UTC-6", label: "UTC-6 (Central Time)" },
    { value: "UTC-5", label: "UTC-5 (Eastern Time)" },
    { value: "UTC-4", label: "UTC-4 (Atlantic Time)" },
    { value: "UTC-3", label: "UTC-3 (Argentina, Brazil)" },
    { value: "UTC-2", label: "UTC-2 (Mid-Atlantic)" },
    { value: "UTC-1", label: "UTC-1 (Azores)" },

    // UTC+0
    { value: "UTC+0", label: "UTC+0 (London, Dublin)" },

    // UTC+1 to UTC+14
    { value: "UTC+1", label: "UTC+1 (Paris, Berlin, Rome)" },
    { value: "UTC+2", label: "UTC+2 (Athens, Cairo)" },
    { value: "UTC+3", label: "UTC+3 (Helsinki, Istanbul)" },
    { value: "UTC+4", label: "UTC+4 (Dubai, Baku)" },
    { value: "UTC+5", label: "UTC+5 (Karachi, Tashkent)" },
    { value: "UTC+6", label: "UTC+6 (Dhaka, Almaty)" },
    { value: "UTC+7", label: "UTC+7 (Bangkok, Jakarta)" },
    { value: "UTC+8", label: "UTC+8 (Beijing, Singapore)" },
    { value: "UTC+9", label: "UTC+9 (Tokyo, Seoul)" },
    { value: "UTC+10", label: "UTC+10 (Sydney, Melbourne)" },
    { value: "UTC+11", label: "UTC+11 (New Caledonia)" },
    { value: "UTC+12", label: "UTC+12 (Auckland, Fiji)" },
    { value: "UTC+13", label: "UTC+13 (Tonga)" },
    { value: "UTC+14", label: "UTC+14 (Line Islands)" },
  ];
}

/**
 * Convert a cron expression from a specific timezone to UTC
 * This handles the conversion when saving a cron job
 */
export function convertCronToUTC(
  cronExpression: string,
  fromTimezone: string
): string {
  if (fromTimezone === "UTC+0") {
    return cronExpression;
  }

  // Validate cron expression format first
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error("Invalid cron expression format");
  }

  try {
    // If hour is a wildcard or interval, don't convert - it doesn't make sense
    if (parts[1] === "*" || parts[1].includes("/")) {
      return cronExpression;
    }

    // Handle ranges (e.g., "9-17") and lists (e.g., "9,12,15")
    if (parts[1].includes("-") || parts[1].includes(",")) {
      return convertComplexHourExpression(cronExpression, fromTimezone, -1);
    }

    // Parse the UTC offset from the timezone string
    const offset = parseUTCOffset(fromTimezone);

    // Get the hour from the cron expression (minute stays the same)
    const hour = Number.parseInt(parts[1]);

    // Validate hour is a valid number
    if (Number.isNaN(hour)) {
      return cronExpression;
    }

    // Convert to UTC by subtracting the offset
    let utcHour = hour - offset;

    // Handle hour overflow/underflow
    if (utcHour < 0) {
      utcHour += 24;
    } else if (utcHour >= 24) {
      utcHour -= 24;
    }

    // Replace only the hour, keep minute and other parts unchanged
    return `${parts[0]} ${utcHour} ${parts[2]} ${parts[3]} ${parts[4]}`;
  } catch (error) {
    console.error("Error converting cron to UTC:", error);
    throw new Error("Invalid cron expression or timezone");
  }
}

/**
 * Parse UTC offset from timezone string (e.g., "UTC+5" -> 5, "UTC-3" -> -3)
 */
function parseUTCOffset(timezone: string): number {
  if (timezone === "UTC+0") return 0;

  const regex = /^UTC([+-])(\d+(?:\.\d+)?)$/;
  const match = regex.exec(timezone);
  if (!match) {
    throw new Error(`Invalid timezone format: ${timezone}`);
  }

  const sign = match[1] === "+" ? 1 : -1;
  const offset = Number.parseFloat(match[2]);

  return sign * offset;
}

/**
 * Convert hour values in ranges and lists, handling timezone conversion
 */
function convertHourValue(hour: number, offset: number): number {
  let convertedHour = hour + offset;

  // Handle hour overflow/underflow
  if (convertedHour < 0) {
    convertedHour += 24;
  } else if (convertedHour >= 24) {
    convertedHour -= 24;
  }

  return convertedHour;
}

/**
 * Convert complex hour expressions (ranges and lists) with timezone conversion
 */
function convertComplexHourExpression(
  cronExpression: string,
  timezone: string,
  direction: number // -1 for toUTC, +1 for fromUTC
): string {
  const parts = cronExpression.trim().split(/\s+/);
  const offset = parseUTCOffset(timezone) * direction;
  const hourPart = parts[1];

  let convertedHourPart: string;

  if (hourPart.includes(",")) {
    // Handle lists like "9,12,15"
    const hours = hourPart.split(",").map((h) => {
      const hour = Number.parseInt(h.trim());
      return Number.isNaN(hour) ? h : convertHourValue(hour, offset).toString();
    });
    convertedHourPart = hours.join(",");
  } else if (hourPart.includes("-")) {
    // Handle ranges like "9-17"
    const [start, end] = hourPart
      .split("-")
      .map((h) => Number.parseInt(h.trim()));
    if (!Number.isNaN(start) && !Number.isNaN(end)) {
      const convertedStart = convertHourValue(start, offset);
      const convertedEnd = convertHourValue(end, offset);
      convertedHourPart = `${convertedStart}-${convertedEnd}`;
    } else {
      convertedHourPart = hourPart; // Keep original if parsing fails
    }
  } else {
    convertedHourPart = hourPart; // Fallback
  }

  return `${parts[0]} ${convertedHourPart} ${parts[2]} ${parts[3]} ${parts[4]}`;
}

/**
 * Convert a UTC cron expression back to a specific timezone
 * This handles displaying stored UTC cron in user's local timezone when editing
 */
export function convertCronFromUTC(
  utcCronExpression: string,
  toTimezone: string
): string {
  if (toTimezone === "UTC+0") {
    return utcCronExpression;
  }

  // Validate cron expression format first
  const parts = utcCronExpression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error("Invalid cron expression format");
  }

  try {
    // If hour is a wildcard or interval, don't convert - it doesn't make sense
    if (parts[1] === "*" || parts[1].includes("/")) {
      return utcCronExpression;
    }

    // Handle ranges (e.g., "9-17") and lists (e.g., "9,12,15")
    if (parts[1].includes("-") || parts[1].includes(",")) {
      return convertComplexHourExpression(utcCronExpression, toTimezone, 1);
    }

    // Parse the UTC offset from the timezone string
    const offset = parseUTCOffset(toTimezone);

    // Get the hour from the UTC cron expression (minute stays the same)
    const hour = Number.parseInt(parts[1]);

    // Validate hour is a valid number
    if (Number.isNaN(hour)) {
      return utcCronExpression;
    }

    // Convert from UTC by adding the offset
    let localHour = hour + offset;

    // Handle hour overflow/underflow
    if (localHour < 0) {
      localHour += 24;
    } else if (localHour >= 24) {
      localHour -= 24;
    }

    // Replace only the hour, keep minute and other parts unchanged
    return `${parts[0]} ${localHour} ${parts[2]} ${parts[3]} ${parts[4]}`;
  } catch (error) {
    console.error("Error converting cron from UTC:", error);
    return utcCronExpression; // Return original if conversion fails
  }
}
