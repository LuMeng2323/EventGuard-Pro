<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import type {
  EventStaffingDraft,
  EventStaffingEstimate,
} from "~/types/eventStaffing";
import {
  isStaffingCount,
  staffingTotal,
  validateStaffingEstimate,
} from "~/composables/useEventStaffing";
const props = defineProps<{
  modelValue: boolean;
  eventName: string;
  estimate: EventStaffingEstimate | null;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [draft: EventStaffingDraft];
}>();
const formRef = ref<FormInstance>();
const form = reactive<EventStaffingDraft>({
  securityCount: 0,
  screeningCount: 0,
  note: "",
});
const total = computed(() =>
  isStaffingCount(form.securityCount) && isStaffingCount(form.screeningCount)
    ? staffingTotal(form)
    : null,
);
const countRule = {
  validator: (
    _rule: unknown,
    value: unknown,
    callback: (error?: Error) => void,
  ) =>
    callback(
      isStaffingCount(value)
        ? undefined
        : new Error("Enter a whole number of 0 or more"),
    ),
  trigger: "change",
};
const rules: FormRules = {
  securityCount: [countRule],
  screeningCount: [countRule],
};
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return;
    Object.assign(form, {
      securityCount: props.estimate?.securityCount ?? 0,
      screeningCount: props.estimate?.screeningCount ?? 0,
      note: props.estimate?.note ?? "",
    });
    await nextTick();
    formRef.value?.clearValidate();
  },
  { immediate: true },
);
const submit = async () => {
  if (!(await formRef.value?.validate().catch(() => false))) return;
  try {
    validateStaffingEstimate(form);
    emit("submit", { ...form });
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : "Invalid staffing estimate",
    );
  }
};
</script>
<template>
  <el-drawer
    :model-value="modelValue"
    direction="rtl"
    size="min(520px, 100vw)"
    :title="estimate ? 'Edit Staffing Estimate' : 'Add Staffing Estimate'"
    append-to-body
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <p class="mb-6 text-sm text-slate-500">{{ eventName }}</p>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      scroll-to-error
      @submit.prevent="submit"
    >
      <el-form-item label="Security Guards" prop="securityCount" required>
        <el-input-number
          v-model="form.securityCount"
          :min="0"
          :step="1"
          class="!w-full"
        />
      </el-form-item>
      <el-form-item label="Screening Staff" prop="screeningCount" required>
        <el-input-number
          v-model="form.screeningCount"
          :min="0"
          :step="1"
          class="!w-full"
        />
      </el-form-item>
      <div
        class="mb-6 flex items-center justify-between rounded-lg bg-slate-50 p-4"
      >
        <span class="text-sm text-slate-500">Total Staff</span>
        <strong class="text-xl text-slate-900">{{ total ?? "—" }}</strong>
      </div>
      <el-form-item label="Note" prop="note">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="4"
          placeholder="Optional staffing notes"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Cancel</el-button>
      <el-button type="primary" @click="submit">Save Estimate</el-button>
    </template>
  </el-drawer>
</template>
