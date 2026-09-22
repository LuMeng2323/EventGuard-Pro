<script setup lang="ts">
import CostPageHeader from "~/components/cost/CostPageHeader.vue";
import CostMonthNavigator from "~/components/cost/CostMonthNavigator.vue";
import CostSummaryCards from "~/components/cost/CostSummaryCards.vue";
import CostEventTable from "~/components/cost/CostEventTable.vue";
import CostRateSettings from "~/components/cost/CostRateSettings.vue";
import type { CostRate } from "~/types/cost";
definePageMeta({ title: "Estimated Staffing Costs" });
const { ready, available, month, rate, result, saveRate } = useCostEstimate();
const save = (draft: CostRate) => {
  try {
    saveRate(draft);
    ElMessage.success("Daily rates saved");
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : "Unable to save rates",
    );
  }
};
</script>

<template>
  <div class="mx-auto max-w-[1600px] space-y-6">
    <CostPageHeader />
    <el-skeleton v-if="!ready" :rows="10" animated />
    <el-alert
      v-else-if="!available"
      title="Cost estimates are unavailable. Check browser storage and reload."
      type="error"
      :closable="false"
    />
    <template v-else>
      <CostMonthNavigator v-model="month" />
      <el-alert
        v-if="result.error"
        :title="result.error"
        type="error"
        :closable="false"
      />
      <template v-else>
        <CostSummaryCards :summary="result.summary" />
        <CostEventTable :rows="result.rows" />
      </template>
      <CostRateSettings :rate="rate" @save="save" />
    </template>
  </div>
</template>

<style scoped>
/* Page appearance is provided by utility classes and the Cost components. */
</style>
