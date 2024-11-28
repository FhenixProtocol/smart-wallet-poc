export const getTimestamp = () => Math.floor(Date.now() / 1000);

export const timeUntilTimestamp = (ts: number): string => {
  const now = getTimestamp();
  const diff = Math.max(0, ts - now);

  const units = [
    { label: "y", value: 365 * 24 * 60 * 60 }, // Years
    { label: "m", value: 30 * 24 * 60 * 60 }, // Months (approx)
    { label: "w", value: 7 * 24 * 60 * 60 }, // Weeks
    { label: "d", value: 24 * 60 * 60 }, // Days
    { label: "h", value: 60 * 60 }, // Hours
    { label: "m", value: 60 }, // Minutes
  ];

  if (diff > units[0].value) return ">1y";

  for (const unit of units) {
    const unitCount = Math.floor(diff / unit.value);
    if (unitCount > 0) {
      return `${unitCount}${unit.label}`;
    }
  }

  return "0m";
};

export const formattedTimestamp = (ts: number): string => {
  const date = new Date(ts * 1000); // Convert seconds to milliseconds
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};
