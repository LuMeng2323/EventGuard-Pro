import type { Event } from "~/types/event";
import { eventsInMonth, shiftMonth, startOfDay } from "~/utils/eventDate";
import { fromStoredEvent, toStoredEvent } from "~/utils/eventAdapter";
import { venueGroup } from "~/constants/event";

export const useEvents = () => {
  const { events: storedEvents, costs } = useEventCosts();
  const ready = ref(false);
  const month = ref(shiftMonth(Date.now(), 0));
  onMounted(() => {
    ready.value = true;
  });
  const events = computed(() => storedEvents.value.map(fromStoredEvent));
  const monthlyEvents = computed(() =>
    eventsInMonth(events.value, month.value),
  );
  const search = ref("");
  const typeFilter = ref("");
  const venueFilter = ref("");
  const filteredEvents = computed(() =>
    monthlyEvents.value.filter(
      (event) =>
        event.name.toLowerCase().includes(search.value.trim().toLowerCase()) &&
        (!typeFilter.value || event.type === typeFilter.value) &&
        (!venueFilter.value || event.venues.includes(venueFilter.value)),
    ),
  );
  const saveEvent = (draft: Event) => {
    const allowed =
      draft.type === "exhibition"
        ? venueGroup[0]!.options
        : venueGroup.flatMap((group) => group.options);
    if (
      !draft.name.trim() ||
      !draft.manager.trim() ||
      !["exhibition", "meeting"].includes(draft.type) ||
      !draft.venues.length ||
      draft.venues.some((venue) => !allowed.includes(venue)) ||
      !Number.isFinite(draft.startDate) ||
      !Number.isFinite(draft.endDate) ||
      draft.endDate < draft.startDate
    )
      throw new Error(
        "Complete the required event fields and valid date range",
      );
    if (
      [draft.area, draft.expectedVisitors].some(
        (value) =>
          value !== undefined && (!Number.isFinite(value) || value < 0),
      ) ||
      (draft.expectedVisitors !== undefined &&
        !Number.isInteger(draft.expectedVisitors))
    )
      throw new Error("Enter valid area and visitor values");
    const index = storedEvents.value.findIndex(
      (event) => String(event.id) === draft.id,
    );
    if (draft.id && index === -1)
      throw new Error("This event no longer exists");
    const id =
      index >= 0
        ? draft.id
        : String(
            Math.max(
              Date.now(),
              ...storedEvents.value.map((event) => event.id + 1),
            ),
          );
    const saved = {
      ...draft,
      id,
      startDate: startOfDay(draft.startDate),
      endDate: startOfDay(draft.endDate),
      name: draft.name.trim(),
      manager: draft.manager.trim(),
      createdAt: index >= 0 ? events.value[index]!.createdAt : Date.now(),
      updatedAt: Date.now(),
    };
    const stored = toStoredEvent(saved, storedEvents.value[index]);
    if (index >= 0) storedEvents.value[index] = stored;
    else storedEvents.value.push(stored);
    month.value = shiftMonth(saved.startDate, 0);
  };
  const deleteEvent = async (event: Event) => {
    if (costs.value.some((cost) => String(cost.eventId) === event.id)) {
      ElMessage.warning(
        "Delete the linked staffing record before deleting this event",
      );
      return;
    }
    try {
      await ElMessageBox.confirm(`Delete “${event.name}”?`, "Delete event", {
        type: "warning",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      });
      storedEvents.value = storedEvents.value.filter(
        (item) => String(item.id) !== event.id,
      );
      ElMessage.success("Event deleted");
    } catch (error) {
      if (error !== "cancel" && error !== "close")
        ElMessage.error("Unable to delete event");
    }
  };
  return {
    ready,
    events,
    month,
    monthlyEvents,
    filteredEvents,
    search,
    typeFilter,
    venueFilter,
    saveEvent,
    deleteEvent,
  };
};
