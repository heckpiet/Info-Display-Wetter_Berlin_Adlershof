export function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function getYearProgress(date = new Date(), timezone = "UTC") {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter(({ type }) =>
        ["year", "month", "day", "hour", "minute", "second"].includes(type),
      )
      .map(({ type, value }) => [type, Number(value)]),
  );
  const totalDays = isLeapYear(parts.year) ? 366 : 365;
  const dayOfYear =
    Math.floor(
      (Date.UTC(parts.year, parts.month - 1, parts.day) -
        Date.UTC(parts.year, 0, 1)) /
        86400000,
    ) + 1;
  const dayFraction =
    (parts.hour * 3600 + parts.minute * 60 + parts.second) / 86400;
  const percentage = ((dayOfYear - 1 + dayFraction) / totalDays) * 100;
  return { dayOfYear, totalDays, percentage };
}

export function formatYearProgress(progress, mode = "both", language = "en") {
  const percent = translate(language, "percentYear", {
    percent: progress.percentage.toFixed(2),
  });
  const days = translate(language, "dayYear", {
    day: progress.dayOfYear,
    total: progress.totalDays,
  });
  if (mode === "percentage") return percent;
  if (mode === "days") return days;
  if (mode === "hidden") return "";
  return `${percent} · ${days}`;
}

export function getYearProgressPresentation(
  progress,
  mode = "both",
  language = "en",
) {
  return {
    width: `${progress.percentage}%`,
    label: formatYearProgress(progress, mode, language),
    hidden: mode === "hidden",
  };
}
import { translate } from "./i18n.js?v=3.21.0";
