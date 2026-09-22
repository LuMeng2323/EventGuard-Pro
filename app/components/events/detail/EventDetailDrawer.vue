<script setup lang="ts">
import EventStaffingSummary from "~/components/events/staffing/EventStaffingSummary.vue";
import type { EventStaffingEstimate } from "~/types/eventStaffing";
import type { Event } from "~/types/event";
import { formatEventDate } from "~/utils/eventDate";
const props = defineProps<{
  modelValue: boolean;
  event: Event | null;
  concurrent: Event[];
  estimate: EventStaffingEstimate | null;
  staffingAvailable: boolean;
}>();
defineEmits<{
  "update:modelValue": [value: boolean];
  edit: [event: Event];
  detail: [event: Event];
  staffing: [];
}>();
const fields = computed(() =>
  props.event
    ? [
        ["Type", props.event.type === "meeting" ? "Meeting" : "Exhibition"],
        ["Date", formatEventDate(props.event.startDate, props.event.endDate)],
        ["Venue", props.event.venues.join(", ")],
        ["Organizer", props.event.organizer || "—"],
        ["Manager", props.event.manager],
        ["Phone", props.event.phone || "—"],
        [
          "Area",
          props.event.area == null
            ? "—"
            : `${props.event.area.toLocaleString()} m²`,
        ],
        [
          "Expected visitors",
          props.event.expectedVisitors?.toLocaleString() ?? "—",
        ],
      ]
    : [],
);
</script>
<template>
  <el-drawer
    direction="rtl"
    size="min(560px, 100vw)"
    :model-value="modelValue"
    title="Event details"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="event" class="space-y-6">
      <h2 class="text-2xl font-semibold text-slate-900">{{ event.name }}</h2>
      <dl class="divide-y divide-slate-100">
        <div
          v-for="[label, value] in fields"
          :key="label"
          class="grid grid-cols-[140px_1fr] gap-4 py-3 text-sm"
        >
          <dt class="text-slate-500">{{ label }}</dt>
          <dd class="break-words text-slate-800">{{ value }}</dd>
        </div>
      </dl>
      <section>
        <h3 class="font-semibold text-slate-800">Note</h3>
        <p class="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">
          {{ event.note || "No note." }}
        </p>
      </section>
      <EventStaffingSummary
        :estimate="estimate"
        :available="staffingAvailable"
        @edit="$emit('staffing')"
      />
      <section class="rounded-xl border border-slate-200 p-4">
        <h3 class="font-semibold text-slate-800">Concurrent Events</h3>
        <p class="mt-1 text-xs text-slate-500">
          Events in the same connected overlap group, including linked overlaps.
        </p>
        <p v-if="!concurrent.length" class="mt-3 text-sm text-slate-500">
          No concurrent events.
        </p>
        <button
          v-for="other in concurrent"
          :key="other.id"
          class="mt-3 block w-full rounded-lg bg-slate-50 p-3 text-left hover:bg-blue-50"
          @click="$emit('detail', other)"
        >
          <span class="text-sm font-medium text-blue-600">
            {{ other.name }}
          </span>
          <span class="mt-1 block text-xs text-slate-500">
            {{ formatEventDate(other.startDate, other.endDate) }}
          </span>
        </button>
      </section>
    </div>
    <el-empty v-else description="Event no longer exists" />
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Close</el-button>
      <el-button v-if="event" type="primary" @click="$emit('edit', event)">
        Edit Event
      </el-button>
    </template>
  </el-drawer>
</template>
