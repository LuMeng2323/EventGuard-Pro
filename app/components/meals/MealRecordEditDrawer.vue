<script setup lang="ts">
import type { MealRecord, MealRecordEdit } from "~/types/meal";
import { isMealCount } from "~/utils/mealCalculation";
const props = defineProps<{ record: MealRecord | null }>();
const emit = defineEmits<{
  close: [];
  save: [id: string, changes: MealRecordEdit];
}>();
const form = reactive<MealRecordEdit>({
  quantity: 0,
  recipientId: "",
  recipientName: "",
  message: "",
});
const error = ref("");
watch(
  () => props.record,
  (record) => {
    error.value = "";
    if (record)
      Object.assign(form, {
        quantity: record.quantity,
        recipientId: record.recipientId,
        recipientName: record.recipientName,
        message: record.message,
      });
  },
  { immediate: true },
);
const save = () => {
  if (!isMealCount(form.quantity) || !form.message.trim()) {
    error.value = "Enter a non-negative whole quantity and message";
    return;
  }
  if (props.record) emit("save", props.record.id, { ...form });
};
</script>
<template>
  <el-drawer
    :model-value="!!record"
    title="Edit Meal Record"
    direction="rtl"
    size="min(620px, 100vw)"
    @update:model-value="!$event && $emit('close')"
  >
    <p class="mb-5 text-sm text-slate-500">
      Save updates this record only. Review the message to match your quantity
      or recipient changes; use Send Again separately.
    </p>
    <el-alert v-if="error" :title="error" type="error" :closable="false" />
    <el-alert
      v-if="
        record &&
        isMealCount(form.quantity) &&
        form.quantity < record.suggestedQuantity
      "
      title="Quantity is below the suggestion. Saving is still allowed."
      type="warning"
      :closable="false"
    />
    <el-form label-position="top">
      <el-form-item label="Final quantity"
        ><el-input-number v-model="form.quantity" :min="0" :step="1"
      /></el-form-item>
      <el-form-item label="Recipient name"
        ><el-input v-model="form.recipientName"
      /></el-form-item>
      <el-form-item label="Recipient identifier"
        ><el-input v-model="form.recipientId"
      /></el-form-item>
      <el-form-item label="Message"
        ><el-input v-model="form.message" type="textarea" :rows="10"
      /></el-form-item>
    </el-form>
    <template #footer
      ><el-button @click="$emit('close')">Cancel</el-button
      ><el-button type="primary" @click="save"
        >Save Changes</el-button
      ></template
    >
  </el-drawer>
</template>
