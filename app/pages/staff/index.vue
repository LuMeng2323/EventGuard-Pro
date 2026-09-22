<template>
  <div class="management-page">
    <header class="management-heading">
      <div class="management-eyebrow">TEAM MANAGEMENT</div>
      <h1>Staff</h1>
      <p>Your security team, organized in one place.</p>
    </header>
    <section class="management-metrics" aria-label="Staff overview">
      <div class="management-stat"><span class="management-stat-dot tone-0" /><div><span>Total staff</span><strong>{{ staff.length }}</strong></div></div>
      <div class="management-stat"><span class="management-stat-dot tone-1" /><div><span>Available</span><strong>{{ staff.filter((item) => item.status === "Available").length }}</strong></div></div>
      <div class="management-stat"><span class="management-stat-dot tone-2" /><div><span>Certified</span><strong>{{ staff.filter((item) => item.securityCertificateNo.trim()).length }}</strong></div></div>
    </section>
    <section class="management-panel">
      <div class="management-panel-heading"><div><h2>Filters</h2><p>Find the records you need.</p></div></div>

    <StaffToolBar
      v-model:searchKeyword="searchKeyword"
      v-model:positionFilter="positionFilter"
      v-model:genderFilter="genderFilter"
      v-model:certificateFilter="certificateFilter"
      v-model:statusFilter="statusFilter"
      @add="handleAddStaff"
    />
    </section>
    <section class="management-panel">
      <div class="management-panel-heading">
        <div><h2>Staff directory <span class="management-count">{{ filteredStaff.length }}</span></h2><p>Contact information, positions and availability.</p></div>
        <span class="management-result">{{ filteredStaff.length }} of {{ staff.length }} records</span>
      </div>
    <StaffTable
      :staff="filteredStaff"
      :deleteId="deleteId"
      @edit="handleEditStaff"
      @delete="handleDeleteStaff"
    />
      <div class="management-table-footer">Showing {{ filteredStaff.length }} staff members</div>
    </section>
    <StaffFormDialog
      :staff="editingStaff"
      v-model="showFormDialog"
      @submit="handleStaffSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import StaffTable from "~/components/staff/StaffTable.vue";
import StaffToolBar from "~/components/staff/StaffToolBar.vue";
import StaffFormDialog from "~/components/staff/StaffFormDialog.vue";
import type { StaffItem } from "~/types/staff";

definePageMeta({
  title: "Staff Management",
});

const staff = ref<StaffItem[]>([
  {
    id: 1,
    name: "John Doe",
    staffNo: "S001",
    gender: "Male",
    status: "Available",
    positionId: 1,
    idNumber: "",
    idAddress: "",
    securityCertificateNo: "SC001",
    hireDate: 1735689600,
    phone: "+1234567890",
  },
  {
    id: 2,
    name: "Jane Smith",
    staffNo: "S002",
    gender: "Female",
    status: "Leave",
    positionId: 5,
    idNumber: "",
    idAddress: "",
    securityCertificateNo: "",
    hireDate: 1738368000,
    phone: "+0987654321",
  },
]);

const searchKeyword = ref("");
const positionFilter = ref<number | "">("");
const genderFilter = ref<StaffItem["gender"] | "">("");
const certificateFilter = ref<boolean | "">("");
const statusFilter = ref("");

const filteredStaff = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  return staff.value.filter((member) => {
    const matchesKeyword = member.name.toLowerCase().includes(keyword);
    const matchesPosition =
      positionFilter.value === "" || member.positionId === positionFilter.value;
    const matchesGender =
      !genderFilter.value || member.gender === genderFilter.value;
    const matchesCertificate =
      certificateFilter.value === "" ||
      Boolean(member.securityCertificateNo.trim()) === certificateFilter.value;
    const matchesStatus =
      statusFilter.value === "all" ||
      (statusFilter.value
        ? member.status === statusFilter.value
        : member.status === "Available" || keyword !== "");
    return (
      matchesKeyword &&
      matchesPosition &&
      matchesGender &&
      matchesCertificate &&
      matchesStatus
    );
  });
});

const showFormDialog = ref(false);

const editingStaff = ref<StaffItem | null>(null);
const handleAddStaff = () => {
  editingStaff.value = null;
  showFormDialog.value = true;
};
const handleStaffSubmit = (newStaff: StaffItem) => {
  const index = staff.value.findIndex((s) => s.id === newStaff.id);
  if (index !== -1) {
    // Update existing staff member
    staff.value[index] = newStaff;
  } else {
    // Add new staff member
    staff.value.push(newStaff);
  }
  showFormDialog.value = false;
};
const handleEditStaff = (staffMember: StaffItem) => {
  editingStaff.value = staffMember;
  showFormDialog.value = true;
  console.log("Editing staff member:", staffMember);
};

const deleteId = ref<number | null>(null);

const handleDeleteStaff = async (staffId: number) => {
  console.log("Deleting staff member with ID:", staffId);
  //   staff.value = staff.value.filter((s) => s.id !== staffId);
  const member = staff.value.find((s) => s.id === staffId);
  if (!member) {
    ElMessage.error("Staff member not found");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete the staff member "${member.name}"?`,
      "Confirm Deletion",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      },
    );
    deleteId.value = staffId;
    staff.value = staff.value.filter((s) => s.id !== staffId);
    ElMessage.success(`Staff member "${member.name}" deleted successfully`);
  } catch (e) {
    if (e !== "cancel" && e !== "close") {
      ElMessage.error("Failed to delete staff member");
    }
  } finally {
    deleteId.value = null;
  }
};
</script>
