<script setup lang="ts">
import type { Event } from "~/types/event";
import type { EventOverlapGroup } from "~/composables/useEventOverlap";
import {
  formatEventDate,
  timelinePlacement,
  type monthDays,
} from "~/utils/eventDate";
import EventOverlapBadge from "./EventOverlapBadge.vue";
const props = defineProps<{
  event: Event;
  month: number;
  days: ReturnType<typeof monthDays>;
  today: string;
  group?: EventOverlapGroup;
}>();
defineEmits<{ detail: [event: Event] }>();
const placement = computed(() => timelinePlacement(props.event, props.month));
const label = computed(
  () =>
    `${props.event.name}: ${formatEventDate(props.event.startDate, props.event.endDate)}`,
);
</script>
<template>
  <div class="flex border-b border-slate-100 last:border-0">
    <div
      class="sticky left-0 z-10 w-64 shrink-0 space-y-1 border-r border-slate-200 bg-white p-4"
    >
      <button
        class="block max-w-full truncate text-left text-sm font-semibold text-slate-800 hover:text-blue-600"
        :title="event.name"
        @click="$emit('detail', event)"
      >
        {{ event.name }}
      </button>
      <p
        class="truncate text-xs text-slate-500"
        :title="event.venues.join(', ')"
      >
        {{ event.venues.join(", ") }}
      </p>
      <EventOverlapBadge :group="group" />
    </div>
    <div
      class="relative grid min-h-24 items-center"
      :style="{ gridTemplateColumns: `repeat(${days.length}, 36px)` }"
    >
      <div
        class="pointer-events-none absolute inset-0 grid"
        :style="{ gridTemplateColumns: `repeat(${days.length}, 36px)` }"
      >
        <div
          v-for="day in days"
          :key="day.key"
          class="border-r border-slate-100"
          :class="
            day.key === today ? 'bg-blue-50' : day.weekend ? 'bg-slate-50' : ''
          "
        />
      </div>
      <button
        class="relative mx-0.5 h-9 min-w-0 truncate rounded-md px-2 text-left text-xs font-medium text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        :style="{ ...placement, backgroundColor: group?.color || '#2563eb' }"
        :title="label"
        :aria-label="label"
        @click="$emit('detail', event)"
      >
        {{ event.name }}
      </button>
    </div>
  </div>
</template>
