<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import type { Event } from "~/types/event";
import { venueGroup } from "~/constants/event";
import { startOfDay } from "~/utils/eventDate";
const props = defineProps<{ modelValue: boolean; event: Event | null }>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [event: Event];
}>();
const defaults = () => ({
  name: "",
  type: "exhibition" as Event["type"],
  dates: [] as number[],
  venues: [] as string[],
  manager: "",
  organizer: "",
  phone: "",
  area: undefined as number | undefined,
  expectedVisitors: undefined as number | undefined,
  note: "",
});
const form = reactive(defaults());
const mode = ref<"single" | "range">("single");
const formRef = ref<FormInstance>();
const singleDate = computed({
  get: () => form.dates[0],
  set: (value: number | undefined) => {
    form.dates = value ? [Number(value), Number(value)] : [];
  },
});
const dateRange = computed({
  get: () => form.dates,
  set: (value: (number | string)[] | null) => {
    form.dates = (value || []).map(Number);
  },
});
const venues = computed(() =>
  form.type === "exhibition" ? [venueGroup[0]!] : venueGroup,
);
const required = (message: string) => [
  { required: true, message, trigger: "change" },
];
const rules: FormRules = {
  name: [
    {
      required: true,
      whitespace: true,
      message: "Enter an event name",
      trigger: "blur",
    },
  ],
  type: required("Select an event type"),
  manager: [
    {
      required: true,
      whitespace: true,
      message: "Enter a manager",
      trigger: "blur",
    },
  ],
  venues: [
    {
      type: "array",
      required: true,
      min: 1,
      message: "Select at least one venue",
      trigger: "change",
    },
  ],
  dates: [
    {
      validator: (_rule, value: number[], callback) => {
        if (
          !Array.isArray(value) ||
          value.length !== 2 ||
          value.some((date) => !Number.isFinite(Number(date))) ||
          Number(value[1]) < Number(value[0])
        )
          callback(new Error("Select a valid date or date range"));
        else callback();
      },
      trigger: "change",
    },
  ],
  area: [
    {
      type: "number",
      min: 0,
      message: "Area must not be negative",
      trigger: "change",
    },
  ],
  expectedVisitors: [
    {
      type: "integer",
      min: 0,
      message: "Enter a non-negative whole number",
      trigger: "change",
    },
  ],
};
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      Object.assign(form, defaults());
      return;
    }
    Object.assign(form, defaults());
    if (props.event) {
      Object.assign(form, {
        ...props.event,
        venues: [...props.event.venues],
        dates: [props.event.startDate, props.event.endDate],
      });
      mode.value =
        startOfDay(props.event.startDate) === startOfDay(props.event.endDate)
          ? "single"
          : "range";
    } else mode.value = "single";
    await nextTick();
    formRef.value?.clearValidate();
  },
);
const changeMode = () => {
  form.dates = form.dates.length
    ? [Number(form.dates[0]), Number(form.dates[0])]
    : [];
};
const changeType = () => {
  const allowed = venues.value.flatMap((group) => group.options);
  form.venues = form.venues.filter((venue) => allowed.includes(venue));
};
const submit = async () => {
  if (!(await formRef.value?.validate().catch(() => false))) return;
  emit("submit", {
    id: props.event?.id || "",
    name: form.name,
    type: form.type,
    startDate: Number(form.dates[0]),
    endDate: Number(form.dates[1]),
    venues: [...form.venues],
    manager: form.manager,
    organizer: form.organizer,
    phone: form.phone,
    area: form.area ?? undefined,
    expectedVisitors: form.expectedVisitors ?? undefined,
    note: form.note,
    createdAt: props.event?.createdAt || Date.now(),
    updatedAt: Date.now(),
  });
};
</script>
<template>
  <el-drawer
    direction="rtl"
    size="min(620px, 100vw)"
    :model-value="modelValue"
    :title="event ? 'Edit Event' : 'Add Event'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      scroll-to-error
      :scroll-into-view-options="{ behavior: 'smooth', block: 'center' }"
    >
      <el-form-item label="Event name" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="Event type" prop="type">
        <el-radio-group v-model="form.type" @change="changeType">
          <el-radio-button value="exhibition">Exhibition</el-radio-button>
          <el-radio-button value="meeting">Meeting</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Date" prop="dates">
        <div class="w-full space-y-3">
          <el-radio-group v-model="mode" @change="changeMode">
            <el-radio value="single">Single day</el-radio>
            <el-radio value="range">Date range</el-radio>
          </el-radio-group>
          <el-date-picker
            v-if="mode === 'single'"
            v-model="singleDate"
            type="date"
            value-format="x"
            class="w-full!"
          />
          <el-date-picker
            v-else
            v-model="dateRange"
            type="daterange"
            value-format="x"
            class="w-full!"
            start-placeholder="Start date"
            end-placeholder="End date"
          />
        </div>
      </el-form-item>
      <el-form-item label="Venue" prop="venues">
        <el-select v-model="form.venues" multiple placeholder="Select venues">
          <el-option-group
            v-for="group in venues"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="venue in group.options"
              :key="venue"
              :label="venue"
              :value="venue"
            />
          </el-option-group>
        </el-select>
      </el-form-item>
      <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <el-form-item label="Manager" prop="manager">
          <el-input v-model="form.manager" />
        </el-form-item>
        <el-form-item label="Organizer">
          <el-input v-model="form.organizer" />
        </el-form-item>
        <el-form-item label="Phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="Area (m²)" prop="area">
          <el-input-number v-model="form.area" :min="0" class="w-full!" />
        </el-form-item>
        <el-form-item label="Expected visitors" prop="expectedVisitors">
          <el-input-number
            v-model="form.expectedVisitors"
            :min="0"
            :precision="0"
            class="w-full!"
          />
        </el-form-item>
      </div>
      <el-form-item label="Note">
        <el-input v-model="form.note" type="textarea" :rows="4" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="emit('update:modelValue', false)">Cancel</el-button>
        <el-button type="primary" @click="submit">Save Event</el-button>
      </div>
    </template>
  </el-drawer>
</template>
