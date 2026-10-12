/**
 * APDO Operations Management System
 * Time formatting, parsing, and duration calculation utilities.
 */

import { TimeSlot, SessionNumber } from '../types/database';

/**
 * Format "HH:mm:ss" or "HH:mm" into 12-hour format "h:mm A" (e.g. "17:30:00" -> "5:30 PM")
 */
export const formatTime12h = (timeStr?: string | null): string => {
  if (!timeStr) return '--:--';
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return timeStr;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, '0');
  
  if (isNaN(hours)) return timeStr;

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours12}:${minutes} ${period}`;
};

/**
 * Format "HH:mm:ss" or "HH:mm" into standard 24-hour format "HH:mm" (e.g. "08:00:00" -> "08:00")
 */
export const formatTime24h = (timeStr?: string | null): string => {
  if (!timeStr) return '--:--';
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return timeStr;
  return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
};

/**
 * Format a time range into consistent 12-hour format: "5:30 PM – 7:00 PM"
 * Optionally append 24-hour: "5:30 PM – 7:00 PM (17:30 – 19:00)"
 */
export const formatTimeRange = (
  startTime?: string | null,
  endTime?: string | null,
  include24h: boolean = false
): string => {
  const start12 = formatTime12h(startTime);
  const end12 = formatTime12h(endTime);
  if (!include24h) {
    return `${start12} – ${end12}`;
  }
  const start24 = formatTime24h(startTime);
  const end24 = formatTime24h(endTime);
  return `${start12} – ${end12} (${start24} – ${end24})`;
};

/**
 * Calculate total minutes between two "HH:mm:ss" or "HH:mm" time strings
 */
export const calculateDurationMinutes = (
  startTime?: string | null,
  endTime?: string | null
): number => {
  if (!startTime || !endTime) return 0;
  const parseToMinutes = (t: string): number => {
    const parts = t.trim().split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  const startMins = parseToMinutes(startTime);
  const endMins = parseToMinutes(endTime);
  const diff = endMins - startMins;
  return diff > 0 ? diff : 0;
};

export interface SessionInfo {
  sessionNumber: SessionNumber;
  label: string;
  startTime: string; // "17:30:00"
  endTime: string;   // "19:00:00"
  start12h: string;  // "5:30 PM"
  end12h: string;    // "7:00 PM"
  start24h: string;  // "17:30"
  end24h: string;    // "19:00"
  timeRange12h: string; // "5:30 PM – 7:00 PM"
  durationMinutes: number; // 90
}

/**
 * Retrieve concrete session times (Session 1 or Session 2) from a TimeSlot record
 */
export const getSessionTimes = (
  slot: TimeSlot,
  sessionNumber: SessionNumber = 1
): SessionInfo => {
  const isSession1 = sessionNumber === 1;
  const rawStart = isSession1
    ? slot.session_1_start || slot.start_time || '08:00:00'
    : slot.session_2_start || '09:45:00';
  const rawEnd = isSession1
    ? slot.session_1_end || '09:30:00'
    : slot.session_2_end || slot.end_time || '11:15:00';

  const duration = calculateDurationMinutes(rawStart, rawEnd) || 90;

  return {
    sessionNumber,
    label: `Session ${sessionNumber}`,
    startTime: rawStart,
    endTime: rawEnd,
    start12h: formatTime12h(rawStart),
    end12h: formatTime12h(rawEnd),
    start24h: formatTime24h(rawStart),
    end24h: formatTime24h(rawEnd),
    timeRange12h: `${formatTime12h(rawStart)} – ${formatTime12h(rawEnd)}`,
    durationMinutes: duration
  };
};

/**
 * Validation helper for two sessions in a Time Window:
 * - Session 1 End > Session 1 Start
 * - Break End >= Break Start
 * - Session 2 Start >= Session 1 End (no overlap)
 * - Session 2 End > Session 2 Start
 */
export const validateTimeWindowSessions = (config: {
  session_1_start: string;
  session_1_end: string;
  break_start?: string;
  break_end?: string;
  session_2_start: string;
  session_2_end: string;
}): { isValid: boolean; errorMessage?: string } => {
  const toMins = (t: string) => {
    const parts = t.split(':');
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  };

  const s1Start = toMins(config.session_1_start);
  const s1End = toMins(config.session_1_end);
  const s2Start = toMins(config.session_2_start);
  const s2End = toMins(config.session_2_end);

  if (s1End <= s1Start) {
    return {
      isValid: false,
      errorMessage: 'Session 1 End Time must be later than Session 1 Start Time.'
    };
  }

  if (s2Start < s1End) {
    return {
      isValid: false,
      errorMessage: 'Session 2 cannot start before Session 1 ends (overlapping sessions prohibited).'
    };
  }

  if (s2End <= s2Start) {
    return {
      isValid: false,
      errorMessage: 'Session 2 End Time must be later than Session 2 Start Time.'
    };
  }

  if (config.break_start && config.break_end) {
    const bStart = toMins(config.break_start);
    const bEnd = toMins(config.break_end);
    if (bEnd < bStart) {
      return {
        isValid: false,
        errorMessage: 'Break End Time cannot be earlier than Break Start Time.'
      };
    }
  }

  return { isValid: true };
};
