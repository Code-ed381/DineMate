import { formatDistanceStrict } from "date-fns";

export const formatDateTimeWithSuffix = (isoString) => {
  if (!isoString) return "N/A";

  const date = new Date(isoString);
  if (isNaN(date)) return "Invalid date";

  return formatDistanceStrict(date, new Date(), { addSuffix: true });
}

export const elapsedMinutesSince = (iso) => {
  try {
    const then = new Date(iso);
    const diff = Date.now() - then.getTime();
    return Math.floor(diff / 60000);
  } catch {
    return 0;
  }
}

export const formatDateTime = (inputDate) => {
  const date = new Date(inputDate);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    // Show only time (HH:MM:SS am/pm)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } else {
    // Show date + time (Day, DD Mon YY, HH:MM am/pm)
    return date.toLocaleString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}
