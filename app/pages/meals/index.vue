<script setup lang="ts">
import type { MealRecordEdit } from "~/types/meal";
import MealPageHeader from "~/components/meals/MealPageHeader.vue";
import MealRecordTable from "~/components/meals/MealRecordTable.vue";
import MealRecordDetailDrawer from "~/components/meals/MealRecordDetailDrawer.vue";
import MealRecordEditDrawer from "~/components/meals/MealRecordEditDrawer.vue";
definePageMeta({ title: "Meal Records" });
const { history, available, storageError, edit, resend } = useMealRecords();
const detailId = ref("");
const editId = ref("");
const detail = computed(
  () => history.value.find((r) => r.id === detailId.value) ?? null,
);
const editing = computed(
  () => history.value.find((r) => r.id === editId.value) ?? null,
);
const save = (id: string, changes: MealRecordEdit) => {
  try {
    edit(id, changes);
    editId.value = "";
    ElMessage.success("Record updated. No message was sent.");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "Unable to save");
  }
};
const sendAgain = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      "Send this record's current message to its recipient again?",
      "Send Again",
      { confirmButtonText: "Send Again", cancelButtonText: "Cancel" },
    );
  } catch {
    return;
  }
  try {
    const record = await resend(id);
    if (record.sendStatus === "failed")
      ElMessage.warning(
        record.sendAttempts.at(-1)?.errorMessage || "Sending failed",
      );
    else ElMessage.success("Meal order sent");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "Unable to send");
  }
};
</script>
<template>
  <div class="mx-auto max-w-[1600px] space-y-6">
    <MealPageHeader />
    <el-alert
      title="Sending integration is not configured. Attempts are recorded as failed; no messages are delivered."
      type="warning"
      :closable="false"
    />
    <el-alert
      v-if="storageError"
      :title="storageError"
      type="error"
      :closable="false"
    />
    <section class="rounded-xl border border-slate-200 bg-white p-6">
      <MealRecordTable
        :records="history"
        :available="available"
        @detail="detailId = $event"
        @edit="editId = $event"
        @resend="sendAgain"
      />
    </section>
    <MealRecordDetailDrawer :record="detail" @close="detailId = ''" />
    <MealRecordEditDrawer :record="editing" @close="editId = ''" @save="save" />
  </div>
</template>
