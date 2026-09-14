<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900">EventGuard Pro</h1>
    <el-row :gutter="20">
        <el-col
            :span="6"
            v-for="item in status" 
            :key="item.value" 
            :xs="24" 
            :sm="12" 
            :md="6">
            <el-card class="mb-5 rounded-xl" shadow="hover">
                <div class=" text-sm text-gray-500">{{ item.title }}</div>
                <div class="mt-3 text-3xl font-semibold text-gray-900">{{ item.value }}</div>
            </el-card>
        </el-col>
    </el-row>
  </div>
  <div class=" rounded-xl bg-white">
    <div class="mb-4 flex items-center justify-between">
        <div>
            <h2 class="text-xl font-bold text-gray-900">Recent Events</h2>
            <p class="text-sm text-gray-500">
                latest events security operations.
            </p>
        </div>
    </div>

    <el-table :data="recentEvents" style="width:100%">
        <el-table-column prop="name" label="Event Name" />
        <el-table-column prop="venue" label="Venue" />
        <el-table-column prop="date" label="Date" />
        <el-table-column prop="staff" label="Staff Assigned" />
        <el-table-column prop="status" label="Status" />
    </el-table>

  </div>
</template>

<script setup lang="ts">
    const status = [
        {
            title: "Today's Events",
            value: '3 events scheduled',
        },
        {
            title: "Staff on Duty",
            value: '128 staff members on duty',
        },
        {
            title: "Security Check Staff",
            value: '36 staff members available',
        },
        {
            title: "Today's Cost",
            value: '¥15,000',
        }
    ]
    const recentEvents = [
  {
    name: 'Asia Media Forum',
    venue: 'Hall 1',
    date: '2026-09-14',
    staff: 58,
    status: 'Ongoing',
  },
  {
    name: 'Digital Economy Expo',
    venue: 'Hall 3',
    date: '2026-09-15',
    staff: 76,
    status: 'Upcoming',
  },
  {
    name: 'Security Training',
    venue: 'Conference Room A',
    date: '2026-09-12',
    staff: 32,
    status: 'Completed',
  },
]
</script>