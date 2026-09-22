<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import type { CostRate } from "~/types/cost";
import { isCostRate } from "~/utils/costCalculation";
const props = defineProps<{ rate: CostRate }>();
const emit = defineEmits<{ save: [rate: CostRate] }>();
const draft = reactive({ ...props.rate });
const formRef = ref<FormInstance>();
watch(
  () => props.rate,
  (value) => Object.assign(draft, value),
  { deep: true },
);
const rule = {
  validator: (_rule: unknown, value: unknown, done: (error?: Error) => void) =>
    done(
      isCostRate({ securityDailyRate: value, screeningDailyRate: value })
        ? undefined
        : new Error("Enter a finite rate of 0 or more"),
    ),
  trigger: "change",
};
const rules: FormRules = {
  securityDailyRate: [rule],
  screeningDailyRate: [rule],
};
const save = async () => {
  if (await formRef.value?.validate().catch(() => false))
    emit("save", { ...draft });
};
</script>
<template>
  <section class="rounded-xl border border-slate-200 bg-white p-6">
    <h2 class="text-lg font-semibold text-slate-800">Daily rate settings</h2>
    <p class="mt-1 mb-5 text-sm text-slate-500">
      Shared CNY rates apply to all event estimates, including previous months.
      Changes apply after saving.
    </p>
    <el-form
      ref="formRef"
      :model="draft"
      :rules="rules"
      label-position="top"
      @submit.prevent="save"
    >
      <div class="flex flex-wrap items-start gap-x-6">
        <el-form-item label="Security daily rate" prop="securityDailyRate"
          ><el-input-number
            v-model="draft.securityDailyRate"
            :min="0"
            :step="10"
        /></el-form-item>
        <el-form-item label="Screening daily rate" prop="screeningDailyRate"
          ><el-input-number
            v-model="draft.screeningDailyRate"
            :min="0"
            :step="10"
        /></el-form-item>
      </div>
      <el-button type="primary" @click="save">Save rates</el-button>
    </el-form>
  </section>
</template>
