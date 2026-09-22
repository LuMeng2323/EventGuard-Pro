<script setup lang="ts">
import type { EventOverlapGroup } from "~/composables/useEventOverlap";
defineProps<{ group?: EventOverlapGroup }>();
</script>
<template>
  <span
    v-if="group"
    class="inline-block whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-medium"
    :style="{ color: group.color, borderColor: group.color }"
  >
    Concurrent ×{{ group.events.length }}
  </span>
</template>
