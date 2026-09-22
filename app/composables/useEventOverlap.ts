import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { Event } from "~/types/event";

export interface EventOverlapGroup {
  id: string;
  events: Event[];
  color: string;
}
const colors = ["#7c3aed", "#059669", "#d97706", "#db2777", "#0891b2"];
export const getOverlapGroups = (events: Event[]): EventOverlapGroup[] => {
  const sorted = [...events].sort(
    (a, b) => a.startDate - b.startDate || a.id.localeCompare(b.id),
  );
  const clusters: Event[][] = [];
  let cluster: Event[] = [];
  let end = -Infinity;
  for (const event of sorted) {
    if (cluster.length && event.startDate > end) {
      clusters.push(cluster);
      cluster = [];
      end = -Infinity;
    }
    cluster.push(event);
    end = Math.max(end, event.endDate);
  }
  if (cluster.length) clusters.push(cluster);
  return clusters
    .filter((items) => items.length > 1)
    .map((items, index) => ({
      id: items
        .map((event) => event.id)
        .sort()
        .join(":"),
      events: items,
      color: colors[index % colors.length]!,
    }));
};
export const useEventOverlap = (source: MaybeRefOrGetter<Event[]>) => {
  const groups = computed(() => getOverlapGroups(toValue(source)));
  const getOverlapGroupForEvent = (id: string) =>
    groups.value.find((group) => group.events.some((event) => event.id === id));
  const getConcurrentEvents = (id: string) =>
    getOverlapGroupForEvent(id)?.events.filter((event) => event.id !== id) ||
    [];
  const isConcurrent = (id: string) => Boolean(getOverlapGroupForEvent(id));
  return {
    groups,
    getOverlapGroups,
    getOverlapGroupForEvent,
    getConcurrentEvents,
    isConcurrent,
  };
};
