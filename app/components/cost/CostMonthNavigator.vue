<script setup lang="ts">
import EventMonthNavigator from "~/components/events/EventMonthNavigator.vue";
defineProps<{ modelValue: number }>();
defineEmits<{ "update:modelValue": [value: number] }>();
</script>
<template>
  <EventMonthNavigator
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
