<script setup lang="ts">
import type { MealEventItem } from "~/types/meal";
defineProps<{ items: MealEventItem[]; total: number }>();
</script>
<template>
  <el-alert
    v-if="items.some((item) => item.staffCount === null)"
    title="Incomplete suggestion: some events are not estimated. Review the final quantity."
    type="warning"
    :closable="false"
  />
  <el-table :data="items" row-key="eventId">
    <el-table-column prop="eventName" label="Event" min-width="180" />
    <!-- @vue-generic {MealEventItem} -->
    <el-table-column label="Staff"
      ><template #default="{ row }">{{
        row.staffCount ?? "Not estimated"
      }}</template></el-table-column
    >
    <template #empty>No active events for this date</template>
  </el-table>
  <p class="mt-3 text-sm font-semibold">
    Suggested total (known staff): {{ total }}
  </p>
</template>
