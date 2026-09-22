<script setup lang="ts">
import type { Event } from "~/types/event";
const props = defineProps<{ events: Event[]; concurrentGroups: number }>();
const cards = computed(() => [
  { label: "Total Events", value: props.events.length },
  {
    label: "Exhibitions",
    value: props.events.filter((event) => event.type === "exhibition").length,
  },
  {
    label: "Meetings",
    value: props.events.filter((event) => event.type === "meeting").length,
  },
  { label: "Concurrent Groups", value: props.concurrentGroups },
]);
</script>
<template>
  <section
    aria-label="Monthly summary"
    class="grid grid-cols-2 gap-4 xl:grid-cols-4"
  >
    <div
      v-for="card in cards"
      :key="card.label"
      class="rounded-xl border border-slate-200 bg-white p-5"
    >
      <p class="text-sm text-slate-500">{{ card.label }}</p>
      <p class="mt-3 text-3xl font-semibold tabular-nums text-slate-900">
        {{ card.value }}
      </p>
    </div>
  </section>
</template>
