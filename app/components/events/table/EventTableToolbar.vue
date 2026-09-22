<script setup lang="ts">
defineProps<{
  search: string;
  type: string;
  venue: string;
  venues: string[];
  exporting: boolean;
}>();
defineEmits<{
  "update:search": [value: string];
  "update:type": [value: string];
  "update:venue": [value: string];
  export: [];
}>();
</script>
<template>
  <div class="flex flex-wrap items-center gap-3">
    <el-input
      :model-value="search"
      class="w-60!"
      clearable
      placeholder="Search event name"
      aria-label="Search event name"
      @update:model-value="$emit('update:search', $event)"
    />
    <el-select
      :model-value="type"
      class="w-44!"
      aria-label="Event type"
      @update:model-value="$emit('update:type', $event)"
    >
      <el-option label="All types" value="" />
      <el-option label="Exhibition" value="exhibition" />
      <el-option label="Meeting" value="meeting" />
    </el-select>
    <el-select
      :model-value="venue"
      class="w-52!"
      aria-label="Venue"
      @update:model-value="$emit('update:venue', $event)"
    >
      <el-option label="All venues" value="" />
      <el-option
        v-for="item in venues"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
    <el-button class="ml-auto!" :loading="exporting" @click="$emit('export')">
      Export Excel
    </el-button>
  </div>
</template>
