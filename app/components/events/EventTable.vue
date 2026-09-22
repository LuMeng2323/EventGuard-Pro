<script setup lang="ts">
import type { EventItem } from "~/types/event";
defineProps<{
  events: EventItem[];
  deleteId: number | null;
}>();

const emit = defineEmits<{
  edit: [event: EventItem];
  delete: [eventId: number];
}>();

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-CA");
};
</script>

<template>
  <el-table :data="events" style="width: 100%" class="management-table">
    <el-table-column
      prop="name"
      label="Event Name"
      min-width="190"
      class-name="management-name"
    />
    <el-table-column label="Date" min-width="210">
      <template #default="{ row }">
        {{
          row
            ? formatDate(row.startDate) === formatDate(row.endDate)
              ? formatDate(row.startDate)
              : `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`
            : "-"
        }}
      </template>
    </el-table-column>
    <el-table-column prop="venue" label="Venue" min-width="160">
      <template #default="{ row }">
        {{ row.venue.join(", ") }}
      </template>
    </el-table-column>
    <el-table-column prop="level" label="Level" />
    <el-table-column prop="manager" label="Manager" min-width="140" />
    <el-table-column prop="status" label="Status" min-width="120">
      <template #default="{ row }">
        <span class="management-status" :class="row.status.toLowerCase()"
          ><i />{{ row.status }}</span
        >
      </template>
    </el-table-column>
    <el-table-column label="Actions" fixed="right" min-width="170">
      <template #default="{ row }">
        <NuxtLink
          :to="{ path: '/cost', query: { eventId: row.id } }"
          class="event-cost-link"
          >Costs</NuxtLink
        >
        <el-button type="primary" link size="small" @click="emit('edit', row)"
          >Edit</el-button
        >
        <el-button
          type="danger"
          link
          size="small"
          @click="emit('delete', row.id)"
          :loading="row.id === deleteId"
          :disabled="deleteId === row.id"
          >Delete</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.event-cost-link {
  color: #2563eb;
  font-size: 12px;
  margin-right: 10px;
  text-decoration: none;
}
</style>
