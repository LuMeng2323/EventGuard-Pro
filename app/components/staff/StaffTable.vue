<script setup lang="ts">
import { position } from "~/constants/staff";
import type { StaffItem } from "~/types/staff";
defineProps<{
  staff: StaffItem[];
  deleteId: number | null;
}>();

const emit = defineEmits<{
  edit: [staff: StaffItem];
  delete: [staffId: number];
}>();
</script>

<template>
  <el-table :data="staff"  style="width: 100%" class="management-table">
    <el-table-column prop="staffNo" label="Staff No." />
    <el-table-column prop="name" label="Name" min-width="170" class-name="management-name" />
    <el-table-column label="Position" min-width="180">
      <template #default="{ row }">
        {{ position.find((item) => item.id === row.positionId)?.name || "-" }}
      </template>
    </el-table-column>
    <el-table-column prop="phone" label="Phone" min-width="160" />
    <el-table-column prop="status" label="Status" min-width="120">
      <template #default="{ row }">
        <span class="management-status" :class="row.status.toLowerCase()"><i />{{ row.status }}</span>
      </template>
    </el-table-column>
    <el-table-column label="Actions" fixed="right" min-width="120">
      <template #default="{ row }">
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
