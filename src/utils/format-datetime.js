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