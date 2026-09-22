<script setup lang="ts">
import type { Event } from "~/types/event";
import type { EventOverlapGroup } from "~/composables/useEventOverlap";
import { dayKey, monthDays } from "~/utils/eventDate";
import EventTimelineHeader from "./EventTimelineHeader.vue";
import EventTimelineRow from "./EventTimelineRow.vue";
const props = defineProps<{
  events: Event[];
  month: number;
  groups: EventOverlapGroup[];
}>();
defineEmits<{ detail: [event: Event] }>();
const days = computed(() => monthDays(props.month));
const today = ref("");
onMounted(() => {
  today.value = dayKey(Date.now());
});
const groupByEvent = computed(
  () =>
    new Map(
      props.groups.flatMap((group) =>
        group.events.map((event) => [event.id, group] as const),
      ),
    ),
);
</script>
<template>
  <section class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="border-b border-slate-100 p-5">
      <h2 class="text-lg font-semibold text-slate-800">Monthly timeline</h2>
      <p class="mt-1 text-sm text-slate-500">
        Scroll horizontally to explore dates. Matching colors and badges
        identify concurrent groups.
      </p>
    </div>
    <el-empty
      v-if="!events.length"
      description="No events this month. Add an event or choose another month."
    />
    <div
      v-else
      class="overflow-x-auto"
      tabindex="0"
      aria-label="Scrollable monthly event timeline"
    >
      <div :style="{ width: `${256 + days.length * 36}px` }">
        <EventTimelineHeader :days="days" :today="today" />
        <EventTimelineRow
          v-for="event in events"
          :key="event.id"
          :event="event"
          :month="month"
          :days="days"
          :today="today"
          :group="groupByEvent.get(event.id)"
          @detail="$emit('detail', $event)"
        />
      </div>
    </div>
  </section>
</template>
