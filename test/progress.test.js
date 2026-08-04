import test from "node:test";
import assert from "node:assert/strict";
import {
  formatYearProgress,
  getYearProgress,
  getYearProgressPresentation,
  isLeapYear,
} from "../progress.js";

test("recognizes Gregorian leap years", () => {
  assert.equal(isLeapYear(2024), true);
  assert.equal(isLeapYear(2100), false);
  assert.equal(isLeapYear(2000), true);
});

test("creates a live presentation for every year-progress mode", () => {
  const progress = { dayOfYear: 216, totalDays: 365, percentage: 58.9 };
  assert.deepEqual(getYearProgressPresentation(progress, "days"), {
    width: "58.9%",
    label: "Day 216 of 365",
    hidden: false,
  });
  assert.deepEqual(getYearProgressPresentation(progress, "hidden"), {
    width: "58.9%",
    label: "",
    hidden: true,
  });
});

test("calculates day position in normal and leap years", () => {
  assert.deepEqual(getYearProgress(new Date("2025-12-31T12:00:00Z")), {
    dayOfYear: 365,
    totalDays: 365,
    percentage: (364.5 / 365) * 100,
  });
  assert.equal(
    getYearProgress(new Date("2024-12-31T12:00:00Z")).totalDays,
    366,
  );
});

test("formats all year progress display variants", () => {
  const progress = { dayOfYear: 216, totalDays: 365, percentage: 58.9 };
  assert.equal(formatYearProgress(progress, "percentage"), "58.90% of year");
  assert.equal(formatYearProgress(progress, "days"), "Day 216 of 365");
  assert.equal(
    formatYearProgress(progress, "both"),
    "58.90% of year · Day 216 of 365",
  );
  assert.equal(formatYearProgress(progress, "hidden"), "");
});
