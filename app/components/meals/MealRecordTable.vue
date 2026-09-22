<script setup lang="ts">
import type { MealRecord } from "~/types/meal";
import { formatMealDate } from "~/utils/mealCalculation";
defineProps<{ records: MealRecord[]; available: boolean }>();
defineEmits<{
  detail: [id: string];
  edit: [id: string];
  resend: [id: string];
}>();
</script>
<template>
  <el-table :data="records" row-key="id">
    <!-- @vue-generic {MealRecord} -->
    <el-table-column label="Date" min-width="150"
      ><template #default="{ row }"
        ><el-button link type="primary" @click="$emit('detail', row.id)">{{
          formatMealDate(row.mealDate)
        }}</el-button></template
      ></el-table-column
    >
    <!-- @vue-generic {MealRecord} -->
    <el-table-column label="Events" min-width="200"
      ><template #default="{ row }">{{
        row.eventItems.map((item) => item.eventName).join(" / ") || "No events"
      }}</template></el-table-column
    >
    <el-table-column prop="quantity" label="Quantity" width="100" />
    <!-- @vue-generic {MealRecord} -->
    <el-table-column label="Recipient" min-width="140"
      ><template #default="{ row }">{{
        row.recipientName || "Not configured"
      }}</template></el-table-column
    >
    <el-table-column prop="sendStatus" label="Send Status" width="115" />
    <!-- @vue-generic {MealRecord} -->
    <el-table-column label="Sent At (latest attempt)" min-width="190"
      ><template #default="{ row }">{{
        row.sendAttempts.at(-1)?.sentAt
          ? new Date(row.sendAttempts.at(-1)!.sentAt!).toLocaleString()
          : "—"
      }}</template></el-table-column
    >
    <!-- @vue-generic {MealRecord} -->
    <el-table-column label="Actions" width="180"
      ><template #default="{ row }"
        ><el-button
          link
          type="primary"
          :disabled="!available || row.sendStatus === 'sending'"
          @click="$emit('edit', row.id)"
          >Edit</el-button
        ><el-button
          link
          type="primary"
          :disabled="!available || row.sendStatus === 'sending'"
          @click="$emit('resend', row.id)"
          >Send Again</el-button
        ></template
      ></el-table-column
    >
    <template #empty
      >No meal orders yet. Prepare an order from Events.</template
    >
  </el-table>
</template>
