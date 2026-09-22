import { initialEvents } from "~/constants/initialEvents";
import type { EventItem } from "~/types/event";
import type { EventCostItem, MonthlyCostResult } from "~/types/cost";
import {
  calculateStaffingMonth,
  eventDates,
  migrateDailyRecord,
  validateDailyRecords,
} from "~/utils/cost";

export const useEventCosts = () => {
  const events = useState<EventItem[]>("managed-events", () =>
    structuredClone(initialEvents),
  );
  const costs = useState<EventCostItem[]>("event-costs", () => []);
  const monthlyResults = useState<Record<string, MonthlyCostResult>>(
    "staffing-monthly-results",
    () => ({}),
  );
  const initialized = useState("event-costs-initialized", () => false);
  const storageReady = useState("event-costs-storage-ready", () => false);
  const invalidate = () => {
    monthlyResults.value = {};
    costs.value.forEach((cost) => {
      cost.calculatedCost = null;
      cost.calculatedAt = null;
      cost.monthlyCosts = {};
    });
  };

  onMounted(() => {
    if (initialized.value) return;
    try {
      const current = localStorage.getItem("eventguard-event-costs-v3");
      const previous = current
        ? null
        : localStorage.getItem("eventguard-event-costs-v2");
      const legacy =
        current || previous
          ? null
          : localStorage.getItem("eventguard-event-costs-v1");
      if (current || previous || legacy) {
        const data = JSON.parse(current || previous || legacy!);
        if (
          !Array.isArray(data.events) ||
          !Array.isArray(data.costs) ||
          !data.events.every(
            (event: EventItem) =>
              Number.isFinite(event.id) &&
              typeof event.name === "string" &&
              Array.isArray(event.venue),
          )
        )
          throw new Error("Invalid saved data");
        const loaded: EventCostItem[] = current
          ? data.costs
          : previous
            ? data.costs.map(
                (
                  old: EventCostItem & {
                    dailyRecords: Parameters<typeof migrateDailyRecord>[0][];
                  },
                ) => ({
                  ...old,
                  dailyRecords: old.dailyRecords.map(migrateDailyRecord),
                  legacyData: old,
                  calculatedCost: null,
                  calculatedAt: null,
                  monthlyCosts: {},
                }),
              )
            : data.costs.map((old: { id: string; eventId: number }) => ({
                id: old.id,
                eventId: old.eventId,
                dailyRecords: [],
                calculatedCost: null,
                calculatedAt: null,
                monthlyCosts: {},
                legacyData: old,
              }));
        if (
          new Set(loaded.map((cost) => cost.eventId)).size !== loaded.length ||
          new Set(loaded.map((cost) => cost.id)).size !== loaded.length ||
          !loaded.every(
            (cost) =>
              typeof cost.id === "string" &&
              Array.isArray(cost.dailyRecords) &&
              data.events.some((event: EventItem) => event.id === cost.eventId),
          )
        )
          throw new Error("Invalid cost records");
        costs.value = loaded;
        events.value = data.events.map((event: EventItem) => ({
          ...event,
          costId: loaded.find((cost) => cost.eventId === event.id)?.id,
        }));
        monthlyResults.value = current ? data.monthlyResults || {} : {};
      }
      storageReady.value = true;
    } catch {
      ElMessage.warning(
        "Saved data could not be loaded. It has been preserved; this session will not overwrite it.",
      );
    }
    initialized.value = true;
  });

  watch(
    () =>
      events.value
        .map((event) => `${event.id}:${event.startDate}:${event.endDate}`)
        .join("|"),
    (next, previous) => {
      if (initialized.value && next !== previous) invalidate();
    },
    { flush: "sync" },
  );

  watch(
    [events, costs, monthlyResults],
    () => {
      if (!initialized.value || !storageReady.value) return;
      try {
        localStorage.setItem(
          "eventguard-event-costs-v3",
          JSON.stringify({
            events: events.value,
            costs: costs.value,
            monthlyResults: monthlyResults.value,
          }),
        );
      } catch {
        ElMessage.warning(
          "Changes could not be saved in this browser. They remain available in this session.",
        );
      }
    },
    { deep: true },
  );

  const saveCost = (cost: EventCostItem) => {
    const event = events.value.find((item) => item.id === cost.eventId);
    if (!event) throw new Error("Select an existing event");
    const error = validateDailyRecords(cost, event);
    if (error) throw new Error(error);
    if (
      !cost.id ||
      costs.value.some(
        (item) => item.eventId === cost.eventId && item.id !== cost.id,
      )
    )
      throw new Error("This event already has a staffing record");
    const previous = costs.value.find((item) => item.id === cost.id);
    if (previous && previous.eventId !== cost.eventId)
      throw new Error(
        "An existing record cannot be moved to a different event",
      );
    const saved = JSON.parse(
      JSON.stringify({
        ...cost,
        legacyData: previous?.legacyData,
        calculatedCost: null,
        calculatedAt: null,
        monthlyCosts: {},
      }),
    );
    const index = costs.value.findIndex((item) => item.id === cost.id);
    if (index === -1) costs.value.push(saved);
    else costs.value[index] = saved;
    event.costId = cost.id;
    invalidate();
  };
  const deleteCost = (id: string) => {
    costs.value = costs.value.filter((cost) => cost.id !== id);
    events.value.forEach((event) => {
      if (event.costId === id) event.costId = undefined;
    });
    invalidate();
  };
  const calculateMonth = (month: string) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
      throw new Error("Select a month first");
    const relevantEvents = events.value.filter((event) =>
      eventDates(event).some((date) => date.startsWith(`${month}-`)),
    );
    if (!relevantEvents.length) throw new Error("No events fall in this month");
    const relevant = relevantEvents.map((event) => {
      const cost = costs.value.find((item) => item.eventId === event.id);
      if (!cost)
        throw new Error(
          `${event.name}: create and save daily staffing before calculating this month`,
        );
      const error = validateDailyRecords(cost, event);
      if (error) throw new Error(`${event.name}: ${error}`);
      return cost;
    });
    const now = Date.now();
    const result = calculateStaffingMonth(
      relevant.flatMap((cost) => cost.dailyRecords),
      month,
      now,
    );
    const perEvent = relevant.map((cost) =>
      calculateStaffingMonth(cost.dailyRecords, month, now),
    );
    relevant.forEach((cost, index) => {
      cost.monthlyCosts[month] = perEvent[index]!;
      const months = [
        ...new Set(cost.dailyRecords.map((day) => day.date.slice(0, 7))),
      ];
      if (months.every((key) => cost.monthlyCosts[key])) {
        cost.calculatedCost =
          Math.round(
            months.reduce(
              (sum, key) => sum + cost.monthlyCosts[key]!.total,
              0,
            ) * 100,
          ) / 100;
        cost.calculatedAt = now;
      }
    });
    monthlyResults.value[month] = result;
    return result;
  };
  return {
    events,
    costs,
    monthlyResults,
    saveCost,
    deleteCost,
    calculateMonth,
  };
};
