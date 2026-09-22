<script setup lang="ts">
import type { monthDays } from "~/utils/eventDate";
defineProps<{ days: ReturnType<typeof monthDays>; today: string }>();
</script>
<template>
  <div class="flex border-b border-slate-200 bg-slate-50">
    <div
      class="sticky left-0 z-20 w-64 shrink-0 border-r border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      Event / venue
    </div>
    <div
      class="grid"
      :style="{ gridTemplateColumns: `repeat(${days.length}, 36px)` }"
    >
      <div
        v-for="day in days"
        :key="day.key"
        class="flex items-center justify-center border-r border-slate-100 py-3 text-xs"
        :class="
          day.key === today
            ? 'bg-blue-600 font-bold text-white'
            : day.weekend
              ? 'bg-slate-100 text-slate-400'
              : 'text-slate-600'
        "
        :aria-label="day.key"
        :aria-current="day.key === today ? 'date' : undefined"
      >
        {{ day.number }}
      </div>
    </div>
  </div>
</template>
