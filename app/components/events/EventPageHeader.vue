<script setup lang="ts">
defineEmits<{ add: []; meal: [] }>();
</script>
<template>
  <header class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900">Events</h1>
      <p class="mt-1 text-sm text-slate-500">View and manage monthly events</p>
    </div>
    <div class="flex items-center gap-3">
      <el-button @click="$emit('meal')">Meal Order</el-button
      ><el-button type="primary" @click="$emit('add')">Add Event</el-button>
    </div>
  </header>
</template>
