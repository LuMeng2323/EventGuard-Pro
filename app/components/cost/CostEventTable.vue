<script setup lang="ts">
import type { CostEventRow } from "~/types/cost";
import { formatCost } from "~/utils/costCalculation";
import { formatEventDate } from "~/utils/eventDate";
defineProps<{ rows: CostEventRow[] }>();
</script>
<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6">
    <h2 class="text-lg font-semibold text-slate-800">Cost by event</h2>
    <p class="mb-5 mt-1 text-sm text-slate-500">
      Full inclusive event duration. Events without staffing estimates are
      excluded from totals.
    </p>
    <el-table :data="rows" row-key="event.id">
      <el-table-column prop="event.name" label="Event Name" min-width="180" />
      <!-- @vue-generic {CostEventRow} -->
      <el-table-column label="Date Range" min-width="210"
        ><template #default="{ row }">{{
          formatEventDate(row.event.startDate, row.event.endDate)
        }}</template></el-table-column
      >
      <el-table-column prop="eventDays" label="Event Days" width="105" />
      <!-- @vue-generic {CostEventRow} -->
      <el-table-column label="Security Count" min-width="130"
        ><template #default="{ row }">{{
          row.estimate?.securityCount ?? "—"
        }}</template></el-table-column
      >
      <!-- @vue-generic {CostEventRow} -->
      <el-table-column label="Screening Count" min-width="140"
        ><template #default="{ row }">{{
          row.estimate?.screeningCount ?? "—"
        }}</template></el-table-column
      >
      <!-- @vue-generic {CostEventRow} -->
      <el-table-column label="Security Cost" min-width="150"
        ><template #default="{ row }">{{
          row.cost ? formatCost(row.cost.securityCost) : "Not estimated"
        }}</template></el-table-column
      >
      <!-- @vue-generic {CostEventRow} -->
      <el-table-column label="Screening Cost" min-width="150"
        ><template #default="{ row }">{{
          row.cost ? formatCost(row.cost.screeningCost) : "Not estimated"
        }}</template></el-table-column
      >
      <!-- @vue-generic {CostEventRow} -->
      <el-table-column label="Total Estimated Cost" min-width="175"
        ><template #default="{ row }"
          ><span class="font-semibold">{{
            row.cost ? formatCost(row.cost.totalCost) : "Not estimated"
          }}</span></template
        ></el-table-column
      >
      <template #empty
        ><el-empty description="No events end in this month" :image-size="70"
      /></template>
    </el-table>
  </section>
</template>
