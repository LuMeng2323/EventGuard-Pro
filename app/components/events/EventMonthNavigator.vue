<script setup lang="ts">
import { formatMonth, shiftMonth } from "~/utils/eventDate";
const props = defineProps<{ modelValue: number }>();
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
const changeMonth = (value: number | null) => {
  if (value) emit("update:modelValue", shiftMonth(Number(value), 0));
};
</script>
<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
  >
    <div class="flex items-center gap-4">
      <el-button
        aria-label="Previous month"
        @click="emit('update:modelValue', shiftMonth(props.modelValue, -1))"
      >
        ←
      </el-button>
      <h2 class="min-w-44 text-center text-lg font-semibold text-slate-800">
        {{ formatMonth(props.modelValue) }}
      </h2>
      <el-button
        aria-label="Next month"
        @click="emit('update:modelValue', shiftMonth(props.modelValue, 1))"
      >
        →
      </el-button>
    </div>
    <el-date-picker
      :model-value="props.modelValue"
      type="month"
      value-format="x"
      format="MMM YYYY"
      :clearable="false"
      aria-label="Select month"
      @update:model-value="changeMonth"
    />
  </div>
</template>
