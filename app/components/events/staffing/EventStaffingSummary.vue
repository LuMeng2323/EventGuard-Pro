<script setup lang="ts">
import type { EventStaffingEstimate } from "~/types/eventStaffing";
import { staffingTotal } from "~/composables/useEventStaffing";
defineProps<{ estimate: EventStaffingEstimate | null; available: boolean }>();
defineEmits<{ edit: [] }>();
</script>
<template>
  <section class="rounded-xl border border-slate-200 p-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="font-semibold text-slate-800">Staffing Estimate</h3>
      <el-button
        v-if="estimate"
        text
        type="primary"
        :disabled="!available"
        @click="$emit('edit')"
        >Edit Estimate</el-button
      >
    </div>
    <p v-if="!available" class="mt-3 text-sm text-slate-500">
      Staffing estimates are unavailable.
    </p>
    <template v-else-if="estimate">
      <dl class="mt-4 grid grid-cols-3 gap-3">
        <div
          v-for="[label, value] in [
            ['Security Guards', estimate.securityCount],
            ['Screening Staff', estimate.screeningCount],
            ['Total Staff', staffingTotal(estimate)],
          ]"
          :key="label"
          class="rounded-lg bg-slate-50 p-3"
        >
          <dt class="text-xs text-slate-500">{{ label }}</dt>
          <dd class="mt-2 text-xl font-semibold text-slate-900">{{ value }}</dd>
        </div>
      </dl>
      <p
        v-if="estimate.note"
        class="mt-4 whitespace-pre-wrap break-words text-sm text-slate-600"
      >
        {{ estimate.note }}
      </p>
    </template>
    <div v-else class="py-5 text-center">
      <p class="mb-3 text-sm text-slate-500">No staffing estimate yet.</p>
      <el-button type="primary" plain @click="$emit('edit')"
        >Add Staffing Estimate</el-button
      >
    </div>
  </section>
</template>
