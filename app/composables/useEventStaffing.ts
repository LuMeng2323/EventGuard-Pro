import type { Ref } from "vue";
import type { Event } from "~/types/event";
import type {
  EventStaffingDraft,
  EventStaffingEstimate,
} from "~/types/eventStaffing";

const storageKey = "eventguard-event-staffing-v1";
export const isStaffingCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
export const staffingTotal = (draft: EventStaffingDraft) =>
  draft.securityCount + draft.screeningCount;
export const validateStaffingEstimate = (draft: EventStaffingDraft) => {
  if (
    !isStaffingCount(draft.securityCount) ||
    !isStaffingCount(draft.screeningCount) ||
    !Number.isSafeInteger(staffingTotal(draft))
  )
    throw new Error(
      "Staff counts must be non-negative whole numbers within the supported range",
    );
  if (draft.note !== undefined && typeof draft.note !== "string")
    throw new Error("Note must be text");
};

export const useEventStaffing = (events: Ref<Event[]>) => {
  const estimates = useState<EventStaffingEstimate[]>(
    "event-staffing-estimates",
    () => [],
  );
  const initialized = useState("event-staffing-initialized", () => false);
  const available = useState("event-staffing-available", () => false);
  onMounted(() => {
    if (initialized.value) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("Invalid estimates");
        const ids = new Set<string>();
        const eventIds = new Set<string>();
        for (const item of parsed) {
          if (
            !item ||
            typeof item.id !== "string" ||
            !item.id ||
            typeof item.eventId !== "string" ||
            !item.eventId ||
            !Number.isFinite(item.createdAt) ||
            !Number.isFinite(item.updatedAt) ||
            ids.has(item.id) ||
            eventIds.has(item.eventId)
          )
            throw new Error("Invalid estimate");
          validateStaffingEstimate(item);
          ids.add(item.id);
          eventIds.add(item.eventId);
        }
        estimates.value = parsed;
      }
      available.value = true;
    } catch {
      ElMessage.error(
        "Unable to load staffing estimates. Existing saved data has been preserved.",
      );
    }
    initialized.value = true;
  });
  const getEstimate = (eventId: string) =>
    estimates.value.find((item) => item.eventId === eventId) ?? null;
  const persist = (next: EventStaffingEstimate[]) => {
    if (!available.value)
      throw new Error("Staffing storage is unavailable. Reload and try again.");
    // Commit only after storage succeeds so a failed save cannot appear successful.
    localStorage.setItem(storageKey, JSON.stringify(next));
    estimates.value = next;
  };
  const saveEstimate = (eventId: string, draft: EventStaffingDraft) => {
    if (!events.value.some((event) => event.id === eventId))
      throw new Error("This event no longer exists");
    validateStaffingEstimate(draft);
    const existing = getEstimate(eventId);
    const now = Date.now();
    const saved: EventStaffingEstimate = {
      id: existing?.id ?? crypto.randomUUID(),
      eventId,
      securityCount: draft.securityCount,
      screeningCount: draft.screeningCount,
      note: draft.note?.trim() || undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    persist([
      ...estimates.value.filter((item) => item.eventId !== eventId),
      saved,
    ]);
    return saved;
  };
  const removeEstimate = (eventId: string) => {
    if (getEstimate(eventId))
      persist(estimates.value.filter((item) => item.eventId !== eventId));
  };
  return { available, getEstimate, saveEstimate, removeEstimate };
};
