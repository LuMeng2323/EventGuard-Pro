import { activeOnMealDate, mealSuggestion } from "~/utils/mealCalculation";

// Adapter boundary: replace this provider with daily Schedule data when available.
export const useMealSuggestion = () => {
  const { events, ready } = useEvents();
  const { available, getEstimate } = useEventStaffing(events);
  const sourceAvailable = computed(() => ready.value && available.value);
  const suggest = (date: number) => {
    if (!sourceAvailable.value)
      throw new Error("Staffing data is unavailable. Reload and try again.");
    return mealSuggestion(
      events.value
        .filter((event) =>
          activeOnMealDate(event.startDate, event.endDate, date),
        )
        .map((event) => {
          const estimate = getEstimate(event.id);
          return {
            eventId: event.id,
            eventName: event.name,
            staffCount: estimate
              ? estimate.securityCount + estimate.screeningCount
              : null,
          };
        }),
    );
  };
  return { sourceAvailable, suggest };
};
