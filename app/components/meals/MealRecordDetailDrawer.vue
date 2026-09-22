<script setup lang="ts">
import type { MealRecord } from "~/types/meal";
import { formatMealDate } from "~/utils/mealCalculation";
import EventMealBreakdown from "~/components/events/meal/EventMealBreakdown.vue";
import EventMealMessagePreview from "~/components/events/meal/EventMealMessagePreview.vue";
defineProps<{ record: MealRecord | null }>();
defineEmits<{ close: [] }>();
</script>
<template>
  <el-drawer
    :model-value="!!record"
    title="Meal Order Record"
    direction="rtl"
    size="min(720px, 100vw)"
    @update:model-value="!$event && $emit('close')"
  >
    <div v-if="record" class="space-y-5">
      <h2 class="text-lg font-semibold">
        {{ formatMealDate(record.mealDate) }}
      </h2>
      <EventMealBreakdown
        :items="record.eventItems"
        :total="record.suggestedQuantity"
      />
      <p>
        Final quantity: <strong>{{ record.quantity }}</strong>
      </p>
      <p>
        Recipient: {{ record.recipientName || "Not configured" }} ·
        {{ record.recipientId || "No identifier" }}
      </p>
      <EventMealMessagePreview :message="record.message" />
      <p>Latest send status: {{ record.sendStatus }}</p>
      <p class="text-sm text-slate-500">
        Editing this record does not send it. Status and timestamps describe
        send attempts.
      </p>
      <p class="text-sm">
        Created: {{ new Date(record.createdAt).toLocaleString() }}<br />Updated:
        {{ new Date(record.updatedAt).toLocaleString() }}
      </p>
      <h3 class="font-semibold">Send attempts</h3>
      <div
        v-for="(attempt, index) in record.sendAttempts"
        :key="attempt.id"
        class="rounded-lg border border-slate-200 p-4 text-sm"
      >
        <strong>#{{ index + 1 }} · {{ attempt.status }}</strong>
        <p>Created: {{ new Date(attempt.createdAt).toLocaleString() }}</p>
        <p>
          Sent:
          {{ attempt.sentAt ? new Date(attempt.sentAt).toLocaleString() : "—" }}
        </p>
        <p v-if="attempt.errorMessage" class="mt-2 text-red-600">
          {{ attempt.errorMessage }}
        </p>
      </div>
    </div>
  </el-drawer>
</template>
