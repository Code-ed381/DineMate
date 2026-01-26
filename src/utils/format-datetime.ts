import { formatDistanceStrict } from "date-fns";

export const formatDateTimeWithSuffix = (isoString?: string | null): string => {
  if (!isoString) return "N/A";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid date";

  return formatDistanceStrict(date, new Date(), { addSuffix: true });
};

export const elapsedMinutesSince = (iso?: string | null): number => {
  if (!iso) return 0;
  try {
    const then = new Date(iso);
    const diff = Date.now() - then.getTime();
    return Math.floor(diff / 60000);
  } catch {
    return 0;
  }
};

export const formatDateTime = (inputDate: string | Date): string => {
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
};

export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now.getTime() - notifDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};
