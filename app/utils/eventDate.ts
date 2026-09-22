import type { Event } from "~/types/event";

export const startOfDay = (value: number) => {
  const date = new Date(value);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
};
export const dayKey = (value: number) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export const monthBounds = (month: number) => {
  const date = new Date(month);
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime() - 1,
  };
};
export const shiftMonth = (month: number, offset: number) => {
  const date = new Date(month);
  return new Date(date.getFullYear(), date.getMonth() + offset, 1).getTime();
};
export const formatMonth = (month: number) =>
  new Date(month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
export const formatEventDate = (start: number, end: number) => {
  const first = new Date(start);
  const last = new Date(end);
  const full = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (dayKey(start) === dayKey(end)) return full(first);
  if (first.getFullYear() !== last.getFullYear())
    return `${full(first)} – ${full(last)}`;
  return `${first.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${full(last)}`;
};
export const eventsInMonth = (events: Event[], month: number) => {
  const { start, end } = monthBounds(month);
  return events
    .filter((event) => event.startDate <= end && event.endDate >= start)
    .sort((a, b) => a.startDate - b.startDate || a.name.localeCompare(b.name));
};
export const monthDays = (month: number) => {
  const date = new Date(month);
  const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(date.getFullYear(), date.getMonth(), index + 1);
    return {
      number: index + 1,
      key: dayKey(day.getTime()),
      weekend: day.getDay() === 0 || day.getDay() === 6,
    };
  });
};
export const timelinePlacement = (event: Event, month: number) => {
  const bounds = monthBounds(month);
  const start = new Date(Math.max(event.startDate, bounds.start)).getDate();
  const end = new Date(Math.min(event.endDate, bounds.end)).getDate();
  return { gridColumn: `${start} / ${end + 1}` };
};
