import type { Event } from "~/types/event";
import type { EventStaffingEstimate } from "~/types/eventStaffing";
import type { CostRate, CostEventRow, CostSummary } from "~/types/cost";
import { monthBounds } from "~/utils/eventDate";

export const eventsInCostMonth = (events: Event[], month: number) => {
  const { start, end } = monthBounds(month);
  return events
    .filter((event) => event.endDate >= start && event.endDate <= end)
    .sort((a, b) => a.endDate - b.endDate || a.name.localeCompare(b.name));
};

export const inclusiveEventDays = (start: number, end: number) => {
  const calendarDay = (value: number) => {
    const date = new Date(value);
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  };
  const days = (calendarDay(end) - calendarDay(start)) / 86400000 + 1;
  if (!Number.isFinite(days) || days < 1)
    throw new Error("Invalid event date range");
  return days;
};

export const isCostRate = (value: unknown): value is CostRate => {
  if (!value || typeof value !== "object") return false;
  const rate = value as Partial<CostRate>;
  return [rate.securityDailyRate, rate.screeningDailyRate].every(
    (amount) =>
      typeof amount === "number" && Number.isFinite(amount) && amount >= 0,
  );
};
const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
export const calculateEventCost = (
  event: Event,
  estimate: EventStaffingEstimate | null,
  rate: CostRate,
): CostEventRow => {
  if (!isCostRate(rate))
    throw new Error("Enter valid non-negative daily rates");
  const eventDays = inclusiveEventDays(event.startDate, event.endDate);
  if (!estimate) return { event, estimate, eventDays, cost: null };
  const securityCost = roundMoney(
    estimate.securityCount * rate.securityDailyRate * eventDays,
  );
  const screeningCost = roundMoney(
    estimate.screeningCount * rate.screeningDailyRate * eventDays,
  );
  const totalCost = roundMoney(securityCost + screeningCost);
  if (![securityCost, screeningCost, totalCost].every(Number.isFinite))
    throw new Error("Estimated cost exceeds the supported range");
  return {
    event,
    estimate,
    eventDays,
    cost: { securityCost, screeningCost, totalCost },
  };
};
export const summarizeCosts = (rows: CostEventRow[]): CostSummary => {
  const summary = rows.reduce<CostSummary>(
    (sum, row) => {
      if (row.cost) {
        sum.securityCost += row.cost.securityCost;
        sum.screeningCost += row.cost.screeningCost;
        sum.eventsWithEstimate++;
      }
      return sum;
    },
    { securityCost: 0, screeningCost: 0, totalCost: 0, eventsWithEstimate: 0 },
  );
  summary.securityCost = roundMoney(summary.securityCost);
  summary.screeningCost = roundMoney(summary.screeningCost);
  summary.totalCost = roundMoney(summary.securityCost + summary.screeningCost);
  return summary;
};
export const formatCost = (value: number) =>
  value.toLocaleString("en-CN", { style: "currency", currency: "CNY" });
