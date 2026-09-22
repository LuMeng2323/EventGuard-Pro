<script setup lang="ts">
defineProps<{ message: string }>();
</script>
<template>
  <section>
    <h3 class="mb-2 font-semibold text-slate-800">Message preview</h3>
    <pre
      class="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 font-sans text-sm"
      >{{ message }}</pre>
  </section>
</template>
