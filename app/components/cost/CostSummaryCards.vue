<script setup lang="ts">
import type { CostSummary } from "~/types/cost";
import { formatCost } from "~/utils/costCalculation";
const props = defineProps<{ summary: CostSummary }>();
const cards = computed(() => [
  { label: "Estimated Total Cost", value: formatCost(props.summary.totalCost) },
  { label: "Security Cost", value: formatCost(props.summary.securityCost) },
  { label: "Screening Cost", value: formatCost(props.summary.screeningCost) },
  { label: "Events With Estimate", value: props.summary.eventsWithEstimate },
]);
</script>
<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <section
      v-for="card in cards"
      :key="card.label"
      class="rounded-xl border border-slate-200 bg-white p-6"
    >
      <p class="text-sm text-slate-500">{{ card.label }}</p>
      <p class="mt-3 break-words text-2xl font-semibold text-slate-900">
        {{ card.value }}
      </p>
    </section>
  </div>
</template>
