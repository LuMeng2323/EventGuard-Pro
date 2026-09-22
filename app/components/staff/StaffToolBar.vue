<script setup lang="ts">
import { position } from "~/constants/staff";
import type { StaffItem } from "~/types/staff";

const props = defineProps<{
  searchKeyword: string;
  positionFilter: number | "";
  genderFilter: StaffItem["gender"] | "";
  certificateFilter: boolean | "";
  statusFilter: string;
}>();
const emit = defineEmits<{
  "update:searchKeyword": [value: string];
  "update:positionFilter": [value: number | ""];
  "update:genderFilter": [value: StaffItem["gender"] | ""];
  "update:certificateFilter": [value: boolean | ""];
  "update:statusFilter": [value: string];
  add: [];
}>();

const showMoreFilters = ref(false);
</script>

<template>
  <div class="management-toolbar">
    <div class="management-filters">
      <el-input
        :model-value="props.searchKeyword"
        @update:model-value="emit('update:searchKeyword', $event)"
        style="width: 200px"
        placeholder="Search by name..."
      />
      <el-select
        :model-value="props.positionFilter"
        @update:model-value="emit('update:positionFilter', $event)"
        style="width: 200px"
        placeholder="Filter by position"
      >
        <el-option label="All positions" value="" />
        <el-option
          v-for="item in position"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-select
        :model-value="props.genderFilter"
        @update:model-value="emit('update:genderFilter', $event)"
        style="width: 200px"
        placeholder="Filter by gender"
      >
        <el-option label="All genders" value="" />
        <el-option label="Male" value="Male" />
        <el-option label="Female" value="Female" />
      </el-select>
      <el-select
        :model-value="props.certificateFilter"
        @update:model-value="emit('update:certificateFilter', $event)"
        style="width: 200px"
        placeholder="Security certificate"
      >
        <el-option label="All certificates" value="" />
        <el-option label="With certificate" :value="true" />
        <el-option label="Without certificate" :value="false" />
      </el-select>
      <el-button
        circle
        :aria-expanded="showMoreFilters"
        aria-controls="staff-more-filters"
        :aria-label="
          showMoreFilters ? 'Hide more filters' : 'Show more filters'
        "
        :title="showMoreFilters ? 'Hide more filters' : 'Show more filters'"
        @click="showMoreFilters = !showMoreFilters"
      >
        <svg
          class="h-4 w-4 transition-transform"
          :class="{ 'rotate-180': showMoreFilters }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </el-button>
      <div
        id="staff-more-filters"
        v-show="showMoreFilters"
        class="flex flex-wrap items-center gap-4 basis-full"
      >
        <el-select
          :model-value="props.statusFilter"
          @update:model-value="emit('update:statusFilter', $event)"
          style="width: 200px"
          placeholder="Filter by status"
        >
          <el-option label="Default" value="" />
          <el-option label="All statuses" value="all" />
          <el-option label="Available" value="Available" />
          <el-option label="Leave" value="Leave" />
        </el-select>
      </div>
    </div>
    <div class="management-toolbar-actions">
      <el-button type="primary" @click="emit('add')">Add Staff</el-button>
    </div>
  </div>
</template>
