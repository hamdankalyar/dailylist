import { intervalToDuration, isBefore, type Duration } from "date-fns";
import { getFromStorage } from "./storage";

export type PersistedCountdownState = {
  currentNotificationId?: string;
  completedAtTimestamps: number[];
};

export type CountdownStatus = {
  isOverdue: boolean;
  distance: Duration;
};

export const countdownStorageKey = "dailylist-countdown";
export const frequency = 14 * 24 * 60 * 60 * 1000;

export async function loadCountdownState(): Promise<PersistedCountdownState> {
  const value = await getFromStorage(countdownStorageKey);
  if (
    value &&
    typeof value === "object" &&
    "completedAtTimestamps" in value &&
    Array.isArray(value.completedAtTimestamps) &&
    value.completedAtTimestamps.every(
      (timestamp) =>
        typeof timestamp === "number" && Number.isFinite(timestamp),
    ) &&
    (!("currentNotificationId" in value) ||
      value.currentNotificationId === undefined ||
      typeof value.currentNotificationId === "string")
  ) {
    return value as PersistedCountdownState;
  }
  return { completedAtTimestamps: [] };
}

export function getCountdownStatus(
  timestamp: number,
  now = Date.now(),
): CountdownStatus {
  const isOverdue = isBefore(timestamp, now);
  const distance = intervalToDuration(
    isOverdue ? { start: timestamp, end: now } : { start: now, end: timestamp },
  );
  return { isOverdue, distance };
}
