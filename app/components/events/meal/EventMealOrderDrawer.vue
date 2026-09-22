<script setup lang="ts">
import type { MealOrder } from "~/types/meal";
import {
  mealDay,
  mealMessage,
  isMealCount,
  formatMealDate,
} from "~/utils/mealCalculation";
import { mealRecipient } from "~/constants/meal";
import EventMealBreakdown from "./EventMealBreakdown.vue";
import EventMealMessagePreview from "./EventMealMessagePreview.vue";
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const { suggest } = useMealSuggestion();
const { createAndSend, available } = useMealRecords();
const order = ref<MealOrder | null>(null);
const busy = ref(false);
const error = ref("");
const preview = computed(() => (order.value ? mealMessage(order.value) : ""));
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    error.value = "";
    order.value = null;
    try {
      const date = mealDay(1);
      const suggestion = suggest(date);
      order.value = {
        ...suggestion,
        mealDate: date,
        quantity: suggestion.suggestedQuantity,
        recipientId: mealRecipient.id,
        recipientName: mealRecipient.name,
        message: "",
      };
    } catch (cause) {
      error.value =
        cause instanceof Error ? cause.message : "Unable to prepare meal order";
    }
  },
);
const submit = async () => {
  if (busy.value || !order.value) return;
  if (!isMealCount(order.value.quantity)) {
    error.value = "Enter a non-negative whole meal quantity";
    return;
  }
  busy.value = true;
  try {
    const record = await createAndSend({
      ...order.value,
      message: preview.value,
    });
    if (record.sendStatus === "failed")
      ElMessage.warning(
        "Order recorded. Sending failed: " +
          record.sendAttempts.at(-1)?.errorMessage,
      );
    else ElMessage.success("Meal order sent");
    emit("update:modelValue", false);
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : "Unable to save meal order";
  } finally {
    busy.value = false;
  }
};
</script>
<template>
  <el-drawer
    :model-value="modelValue"
    title="Meal Order"
    direction="rtl"
    size="min(620px, 100vw)"
    :close-on-click-modal="!busy"
    :close-on-press-escape="!busy"
    :show-close="!busy"
    @update:model-value="!busy && emit('update:modelValue', $event)"
  >
    <div class="space-y-5">
      <el-alert
        title="Sending integration is not configured. Send will save the order with a failed attempt; no message will be delivered."
        type="warning"
        :closable="false"
      />
      <el-alert v-if="error" :title="error" type="error" :closable="false" />
      <template v-if="order">
        <h2 class="text-lg font-semibold">
          {{ formatMealDate(order.mealDate) }}
        </h2>
        <p class="text-sm text-slate-500">
          Staffing source: event staffing estimates
        </p>
        <EventMealBreakdown
          :items="order.eventItems"
          :total="order.suggestedQuantity"
        />
        <el-form label-position="top" :disabled="busy">
          <el-form-item label="Final meal quantity"
            ><el-input-number v-model="order.quantity" :min="0" :step="1"
          /></el-form-item>
          <el-alert
            v-if="
              isMealCount(order.quantity) &&
              order.quantity < order.suggestedQuantity
            "
            title="Meal quantity is below the suggested staff count. You can still send."
            type="warning"
            :closable="false"
          />
          <el-form-item label="Recipient name"
            ><el-input
              v-model="order.recipientName"
              placeholder="Not configured"
          /></el-form-item>
          <el-form-item label="Recipient identifier"
            ><el-input v-model="order.recipientId" placeholder="Not configured"
          /></el-form-item>
        </el-form>
        <EventMealMessagePreview :message="preview" />
      </template>
    </div>
    <template #footer
      ><el-button :disabled="busy" @click="emit('update:modelValue', false)"
        >Cancel</el-button
      ><el-button
        type="primary"
        :loading="busy"
        :disabled="!order || !available"
        @click="submit"
        >Send</el-button
      ></template
    >
  </el-drawer>
</template>
