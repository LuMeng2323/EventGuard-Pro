<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { position } from "~/constants/staff";
import type { StaffItem } from "~/types/staff";

const props = defineProps<{
  modelValue: boolean;
  staff: StaffItem | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [staff: StaffItem];
}>();

const formRef = ref<FormInstance>();
const createInitialForm = (): StaffItem => ({
  id: 0,
  staffNo: "",
  name: "",
  gender: "Male",
  status: "Available",
  phone: "",
  idNumber: "",
  idAddress: "",
  securityCertificateNo: "",
  positionId: position[0]?.id ?? 0,
  hireDate: Math.floor(Date.now() / 1000),
});
const form = reactive(createInitialForm());
const hireDate = computed({
  get: () => form.hireDate * 1000,
  set: (value: number | null) => {
    form.hireDate = value ? Math.floor(value / 1000) : 0;
  },
});
const rules: FormRules = {
  staffNo: [
    {
      required: true,
      whitespace: true,
      message: "Staff number is required",
      trigger: "blur",
    },
  ],
  name: [
    {
      required: true,
      whitespace: true,
      message: "Name is required",
      trigger: "blur",
    },
  ],
  positionId: [
    {
      type: "number",
      required: true,
      min: 1,
      message: "Position is required",
      trigger: "change",
    },
  ],
  hireDate: [
    {
      type: "number",
      required: true,
      min: 1,
      message: "Hire date is required",
      trigger: "change",
    },
  ],
};

const handleCancel = () => {
  emit("update:modelValue", false);
};
const handleSubmit = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  emit("submit", {
    ...form,
    id: props.staff ? props.staff.id : Date.now(),
    staffNo: form.staffNo.trim(),
    name: form.name.trim(),
    securityCertificateNo: form.securityCertificateNo.trim(),
  });
  emit("update:modelValue", false);
};

watch(
  () => [props.modelValue, props.staff],
  () => {
    if (props.modelValue) {
      Object.assign(form, props.staff || createInitialForm());
      nextTick(() => formRef.value?.clearValidate());
    }
  },
  { immediate: true },
);
</script>

<template>
  <el-drawer
    class="management-dialog detail-form-dialog"
    direction="rtl"
    size="min(760px, 100vw)"
    :title="props.staff ? 'Edit Staff' : 'Add Staff'"
    :model-value="props.modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header="{ titleId, titleClass }">
      <div class="detail-dialog-heading">
        <span class="detail-dialog-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a7 7 0 0 0-14 0v2M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
          </svg>
        </span>
        <div>
          <div class="detail-dialog-eyebrow">TEAM MANAGEMENT</div>
          <h2 :id="titleId" :class="titleClass">{{ props.staff ? 'Edit Staff' : 'Add Staff' }}</h2>
          <p>Manage employee information and security credentials.</p>
        </div>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="detail-dialog-form"
      scroll-to-error
      :scroll-into-view-options="{ behavior: 'smooth', block: 'center', inline: 'nearest' }"
    >
      <section class="detail-form-section" aria-label="Personal information">
        <div class="detail-section-heading"><span>01</span><div><h3>Personal information</h3><p>Basic identity and contact details.</p></div></div>
        <div class="detail-form-grid">
          <el-form-item label="Staff No." prop="staffNo">
        <el-input v-model="form.staffNo" />
      </el-form-item>
          <el-form-item class="dialog-field-wide" label="Name" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
          <el-form-item label="Gender" prop="gender">
        <el-select v-model="form.gender">
          <el-option label="Male" value="Male" />
          <el-option label="Female" value="Female" />
        </el-select>
      </el-form-item>
          <el-form-item label="Phone" prop="phone">
        <el-input v-model="form.phone" />
      </el-form-item>
        </div>
      </section>
      <section class="detail-form-section" aria-label="Employment details">
        <div class="detail-section-heading"><span>02</span><div><h3>Employment details</h3><p>Role, start date and current status.</p></div></div>
        <div class="detail-form-grid">
          <el-form-item label="Position" prop="positionId">
        <el-select v-model="form.positionId">
          <el-option
            v-for="item in position"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
          <el-form-item label="Hire Date" prop="hireDate">
        <el-date-picker v-model="hireDate" type="date" value-format="x" />
      </el-form-item>
          <el-form-item label="Status" prop="status">
        <el-select v-model="form.status">
          <el-option label="Available" value="Available" />
          <el-option label="Leave" value="Leave" />
        </el-select>
      </el-form-item>
        </div>
      </section>
      <section class="detail-form-section" aria-label="Documents & certification">
        <div class="detail-section-heading"><span>03</span><div><h3>Documents & certification</h3><p>Identity records and security credentials.</p></div></div>
        <div class="detail-form-grid">
          <el-form-item label="ID Number" prop="idNumber">
        <el-input v-model="form.idNumber" />
      </el-form-item>
          <el-form-item label="Security Certificate" prop="securityCertificateNo">
        <el-input
          v-model="form.securityCertificateNo"
          placeholder="Leave blank if none"
        />
      </el-form-item>
          <el-form-item class="dialog-field-wide" label="ID Address" prop="idAddress">
        <el-input v-model="form.idAddress" />
      </el-form-item>
        </div>
      </section>
    </el-form>
    <template #footer>
      <div class="detail-dialog-footer">
        <span class="detail-required-note"><i>*</i> Required fields</span>
        <div>
          <el-button @click="handleCancel">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit">{{ props.staff ? 'Save changes' : 'Create staff' }}</el-button>
        </div>
      </div>
    </template>
  </el-drawer>
</template>
