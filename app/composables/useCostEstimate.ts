import type { CostRate } from "~/types/cost";
import { defaultCostRate } from "~/constants/cost";
import { shiftMonth } from "~/utils/eventDate";
import {
  calculateEventCost,
  eventsInCostMonth,
  isCostRate,
  summarizeCosts,
} from "~/utils/costCalculation";

export const useCostEstimate = () => {
  const { events, ready } = useEvents();
  const { available: staffingAvailable, getEstimate } =
    useEventStaffing(events);
  const month = ref(shiftMonth(Date.now(), 0));
  const rate = useState<CostRate>("cost-estimate-rate", () => ({
    ...defaultCostRate,
  }));
  const initialized = useState("cost-rate-initialized", () => false);
  const rateAvailable = useState("cost-rate-available", () => false);
  const storageKey = "eventguard-cost-rate-v1";
  onMounted(() => {
    if (initialized.value) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        const saved: unknown = JSON.parse(raw);
        if (!isCostRate(saved)) throw new Error("Invalid saved rates");
        rate.value = saved;
      }
      rateAvailable.value = true;
    } catch {
      ElMessage.error(
        "Unable to load cost rates. Saved data has been preserved.",
      );
    }
    initialized.value = true;
  });
  const available = computed(
    () => ready.value && staffingAvailable.value && rateAvailable.value,
  );
  const result = computed(() => {
    try {
      const rows = available.value
        ? eventsInCostMonth(events.value, month.value).map((event) =>
            calculateEventCost(event, getEstimate(event.id), rate.value),
          )
        : [];
      return { rows, summary: summarizeCosts(rows), error: "" };
    } catch (error) {
      return {
        rows: [],
        summary: summarizeCosts([]),
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate estimates",
      };
    }
  });
  const saveRate = (draft: CostRate) => {
    if (!rateAvailable.value)
      throw new Error("Rate storage is unavailable. Reload and try again.");
    if (!isCostRate(draft))
      throw new Error("Rates must be finite numbers of 0 or more");
    const next = {
      securityDailyRate: draft.securityDailyRate,
      screeningDailyRate: draft.screeningDailyRate,
    };
    localStorage.setItem(storageKey, JSON.stringify(next));
    rate.value = next;
  };
  return { ready, available, month, rate: readonly(rate), result, saveRate };
};
