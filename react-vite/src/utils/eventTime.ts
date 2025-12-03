// src/utils/eventTime.ts

// Canonical event status used across the app and map
export type EventStatus = "upcoming" | "live" | "past";

/**
 * Parse a date string coming from the DB.
 *
 * Expected format: "YYYY-MM-DD" (e.g., "2024-10-23")
 * Returns an object with numeric year/month/day, or null if parsing fails.
 */
function parseDateFromDb(dateStr: string | null | undefined) {
  if (!dateStr) return null;

  const trimmed = dateStr.trim();
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (!isoMatch) return null;

  const year = Number(isoMatch[1]);
  const month = Number(isoMatch[2]); // 1–12
  const day = Number(isoMatch[3]);   // 1–31

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }

  return { year, month, day };
}

/**
 * Parse a stored 12-hour time string (from DB) into 24-hour components.
 *
 * Expected formats (compatible with toAmPm / fromAmPm):
 *   "9 pm"
 *   "9pm"
 *   "09:05pm"
 *   "09:05 pm"
 *
 * Returns { hour, minute } in 24-hour time, or null if parsing fails.
 */
function parseStoredAmPmTime(timeStr: string | null | undefined) {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();

  // (H)H[:MM] AM|PM, optional colon and optional space before AM/PM
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?\s?(AM|PM)$/);
  if (!match) return null;

  let [, h, m, suffix] = match;
  let hour = parseInt(h, 10);
  const minute = m ? parseInt(m, 10) : 0;

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  // Convert 12-hour time to 24-hour time
  if (suffix === "PM" && hour < 12) hour += 12; // 1–11 PM -> 13–23
  if (suffix === "AM" && hour === 12) hour = 0; // 12 AM -> 00

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

/**
 * Build a JS Date object from the DB date + stored time string.
 *
 * Both date and time are interpreted in the local time zone.
 * Returns null if either part cannot be parsed.
 */
export function buildEventDate(
  dateStr: string | null | undefined,
  timeStr: string | null | undefined
): Date | null {
  const d = parseDateFromDb(dateStr);
  const t = parseStoredAmPmTime(timeStr);
  if (!d || !t) return null;

  const { year, month, day } = d;
  const { hour, minute } = t;

  // In JS Date, month is zero-based: 0 = January
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/**
 * Compute the logical event status based on date + start/end times.
 *
 * Rules:
 *   - now < start  => "upcoming"
 *   - start <= now <= end => "live"
 *   - now > end    => "past"
 *
 * If date/time cannot be parsed, falls back to "upcoming" by default.
 */
export function getEventStatus(
  dateStr: string | null | undefined,
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  now: Date = new Date()
): EventStatus {
  const start = buildEventDate(dateStr, startTime);
  const end = buildEventDate(dateStr, endTime);

  if (start && end) {
    if (now < start) return "upcoming";
    if (now > end) return "past";
    // Fallback policy for malformed or missing data
    return "live";
  }
  else if (end)
    return (now > end)? "past":"live"
  else if (start)
    return (now < start)?"upcoming":"live"
  else
    // Fallback policy for malformed or missing data
    return "live";
}