<script setup lang="ts">
import type { Event } from "~/types/event";
import { formatEventDate } from "~/utils/eventDate";
defineProps<{ events: Event[] }>();
defineEmits<{
  detail: [event: Event];
  edit: [event: Event];
  delete: [event: Event];
}>();
</script>
<template>
  <el-table
    :data="events"
    row-key="id"
    class="w-full"
    @row-click="$emit('detail', $event)"
  >
    <!-- @vue-generic {Event} -->
    <el-table-column prop="name" label="Event name" min-width="190">
      <template #default="{ row }">
        <el-button type="primary" link @click.stop="$emit('detail', row)">
          {{ row.name }}
        </el-button>
      </template>
    </el-table-column>
    <!-- @vue-generic {Event} -->
    <el-table-column label="Type" width="120">
      <template #default="{ row }">
        <el-tag :type="row.type === 'meeting' ? 'success' : 'primary'">
          {{ row.type === "meeting" ? "Meeting" : "Exhibition" }}
        </el-tag>
      </template>
    </el-table-column>
    <!-- @vue-generic {Event} -->
    <el-table-column label="Date" min-width="220">
      <template #default="{ row }">
        {{ formatEventDate(row.startDate, row.endDate) }}
      </template>
    </el-table-column>
    <!-- @vue-generic {Event} -->
    <el-table-column label="Venue" min-width="170">
      <template #default="{ row }">{{ row.venues.join(", ") }}</template>
    </el-table-column>
    <!-- @vue-generic {Event} -->
    <el-table-column prop="organizer" label="Organizer" min-width="150" />
    <!-- @vue-generic {Event} -->
    <el-table-column prop="manager" label="Manager" min-width="150" />
    <!-- @vue-generic {Event} -->
    <el-table-column label="Area" width="130">
      <template #default="{ row }">
        {{ row.area == null ? "—" : `${row.area.toLocaleString()} m²` }}
      </template>
    </el-table-column>
    <!-- @vue-generic {Event} -->
    <el-table-column label="Expected visitors" width="160">
      <template #default="{ row }">
        {{ row.expectedVisitors?.toLocaleString() ?? "—" }}
      </template>
    </el-table-column>
    <!-- @vue-generic {Event} -->
    <el-table-column label="Actions" fixed="right" width="145">
      <template #default="{ row }">
        <el-button type="primary" link @click.stop="$emit('edit', row)">
          Edit
        </el-button>
        <el-button type="danger" link @click.stop="$emit('delete', row)">
          Delete
        </el-button>
      </template>
    </el-table-column>
    <template #empty>
      <el-empty description="No events match these filters." :image-size="60" />
    </template>
  </el-table>
</template>
