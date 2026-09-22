<script setup lang="ts">
definePageMeta({
  title: "Dashboard",
});

const status = [
  {
    title: "Today's Events",
    value: "3",
    detail: "Events in today's overview",
    icon: "calendar",
    tone: "blue",
    to: "/events",
  },
  {
    title: "Staff on Duty",
    value: "128",
    detail: "Security personnel on duty",
    icon: "users",
    tone: "green",
    to: "/staff",
  },
  {
    title: "Security Check Staff",
    value: "36",
    detail: "Personnel at security checkpoints",
    icon: "shield",
    tone: "violet",
    to: "/deployment",
  },
  {
    title: "Today's Cost",
    value: "¥15,000",
    detail: "Daily operations expenditure",
    icon: "wallet",
    tone: "amber",
    to: "/cost",
  },
];
const icons: Record<string, string> = {
  calendar:
    "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  shield: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-4-11 3 3 5-5",
  wallet:
    "M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6m18 7h-5v4h5",
};
const recentEvents = [
  {
    name: "Asia Media Forum",
    venue: "Hall 1",
    date: "2026-09-14",
    staff: 58,
    status: "Ongoing",
    tone: "green",
  },
  {
    name: "Digital Economy Expo",
    venue: "Hall 3",
    date: "2026-09-15",
    staff: 76,
    status: "Upcoming",
    tone: "blue",
  },
  {
    name: "Security Training",
    venue: "Conference Room A",
    date: "2026-09-12",
    staff: 32,
    status: "Completed",
    tone: "slate",
  },
];
const eventSummary = [
  { label: "Ongoing", tone: "green" },
  { label: "Upcoming", tone: "blue" },
  { label: "Completed", tone: "slate" },
].map((item) => ({
  ...item,
  count: recentEvents.filter((event) => event.status === item.label).length,
}));
const shortcuts = [
  {
    title: "Staff directory",
    description: "Manage your security team",
    to: "/staff",
    icon: "users",
    tone: "green",
  },
  {
    title: "Security deployment",
    description: "Organize on-site coverage",
    to: "/deployment",
    icon: "shield",
    tone: "violet",
  },
  {
    title: "Cost management",
    description: "Review operational costs",
    to: "/cost",
    icon: "wallet",
    tone: "amber",
  },
];
</script>

<template>
  <div class="dashboard">
    <header class="page-heading">
      <div>
        <div class="eyebrow">OPERATIONS OVERVIEW</div>
        <h1>Dashboard</h1>
        <p>A clear view of your events, people and security operations.</p>
      </div>
      <NuxtLink to="/schedule" class="schedule-link">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="icons.calendar" />
        </svg>
        View schedule <span aria-hidden="true">↗</span>
      </NuxtLink>
    </header>

    <section class="metrics" aria-label="Operations statistics">
      <NuxtLink
        v-for="item in status"
        :key="item.title"
        :to="item.to"
        class="metric-card"
      >
        <div class="metric-top">
          <span>{{ item.title }}</span>
          <span class="icon-box" :class="item.tone">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="icons[item.icon]" />
            </svg>
          </span>
        </div>
        <div class="metric-value">{{ item.value }}</div>
        <div class="metric-bottom">
          <span>{{ item.detail }}</span
          ><span aria-hidden="true">↗</span>
        </div>
      </NuxtLink>
    </section>

    <div class="content-grid">
      <section class="panel events-panel">
        <div class="panel-heading">
          <div>
            <h2>
              Recent events
              <span class="count-badge">{{ recentEvents.length }}</span>
            </h2>
            <p>Your latest security operations at a glance.</p>
          </div>
          <NuxtLink to="/events" class="text-link"
            >View all <span aria-hidden="true">→</span></NuxtLink
          >
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Event / venue</th>
                <th>Date</th>
                <th>Staff assigned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in recentEvents" :key="event.name">
                <td>
                  <div class="event-name">{{ event.name }}</div>
                  <div class="event-venue">{{ event.venue }}</div>
                </td>
                <td class="event-date">{{ event.date }}</td>
                <td>
                  <span class="staff-count">{{ event.staff }}</span
                  ><span class="staff-unit"> staff</span>
                </td>
                <td>
                  <span class="status-pill" :class="event.tone"
                    ><span class="status-dot" />{{ event.status }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-footer">
          <span class="footer-dot" />Showing {{ recentEvents.length }} recent
          events<span class="footer-note">All event statuses</span>
        </div>
      </section>

      <aside class="panel summary-panel">
        <div class="panel-heading">
          <div>
            <h2>Event overview</h2>
            <p>Status of the recent events</p>
          </div>
        </div>
        <div class="summary-total">
          <strong>{{ recentEvents.length }}</strong
          ><span>events in overview</span>
        </div>
        <div class="summary-bar" aria-hidden="true">
          <span
            v-for="item in eventSummary"
            :key="item.label"
            :class="item.tone"
            :style="{ flex: item.count }"
          />
        </div>
        <div class="summary-list">
          <div v-for="item in eventSummary" :key="item.label">
            <span
              ><i class="legend-dot" :class="item.tone" />{{ item.label }}</span
            ><strong>{{ item.count }}</strong>
          </div>
        </div>
        <NuxtLink to="/events" class="summary-link"
          >Manage events <span aria-hidden="true">→</span></NuxtLink
        >
      </aside>
    </div>

    <section class="quick-section" aria-label="Quick access">
      <div class="quick-heading">
        <h2>Quick access</h2>
        <span>Your everyday workspace</span>
      </div>
      <div class="quick-grid">
        <NuxtLink
          v-for="item in shortcuts"
          :key="item.to"
          :to="item.to"
          class="quick-card"
        >
          <span class="icon-box" :class="item.tone"
            ><svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="icons[item.icon]" /></svg
          ></span>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
          <span class="quick-arrow" aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1440px;
  margin: 0 auto;
  color: #1e293b;
}
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 4px 0 28px;
}
.eyebrow {
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.8px;
  margin-bottom: 8px;
}
h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1.3;
}
.page-heading p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
}
a {
  text-decoration: none;
  color: inherit;
}
a:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 4px;
}
svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.schedule-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #2563eb;
  border-radius: 9px;
  padding: 11px 16px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.schedule-link:hover {
  background: #1d4ed8;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 26px;
}
.metric-card,
.panel,
.quick-card {
  background: white;
  border: 1px solid #e5eaf0;
  border-radius: 14px;
  box-shadow: 0 2px 4px #0f172a03;
}
.metric-card {
  padding: 20px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.metric-card:hover,
.quick-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 16px #0f172a08;
}
.metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}
.icon-box {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  flex-shrink: 0;
}
.blue {
  color: #2563eb;
  background: #eff6ff;
}
.green {
  color: #059669;
  background: #ecfdf5;
}
.violet {
  color: #7c3aed;
  background: #f5f3ff;
}
.amber {
  color: #d97706;
  background: #fffbeb;
}
.slate {
  color: #64748b;
  background: #f1f5f9;
}
.metric-value {
  margin: 11px 0 15px;
  font-size: 31px;
  font-weight: 700;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.metric-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #94a3b8;
  font-size: 11px;
}
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 22px;
}
.panel {
  overflow: hidden;
  min-width: 0;
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 23px 24px;
}
h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
}
.panel-heading p {
  color: #94a3b8;
  font-size: 12px;
  margin: 6px 0 0;
}
.count-badge {
  display: inline-flex;
  margin-left: 7px;
  padding: 1px 7px;
  border-radius: 6px;
  background: #f1f5f9;
  font-size: 11px;
  color: #64748b;
  vertical-align: middle;
}
.text-link {
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.table-scroll {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  white-space: nowrap;
}
th {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  background: #f8fafc;
  padding: 13px 20px;
  border-block: 1px solid #f1f5f9;
}
td {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 12px;
}
th:first-child,
td:first-child {
  padding-left: 24px;
}
tbody tr:hover {
  background: #fafcff;
}
.event-name {
  font-weight: 600;
  font-size: 13px;
}
.event-venue {
  color: #94a3b8;
  font-size: 11px;
  margin-top: 5px;
}
.event-date {
  color: #64748b;
  font-variant-numeric: tabular-nums;
}
.staff-count {
  font-weight: 600;
}
.staff-unit {
  color: #94a3b8;
  font-size: 11px;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 600;
}
.status-dot,
.footer-dot {
  height: 5px;
  width: 5px;
  border-radius: 50%;
  background: currentColor;
}
.table-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  font-size: 11px;
  color: #94a3b8;
}
.footer-note {
  margin-left: auto;
}
.summary-total {
  padding: 0 24px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.summary-total strong {
  font-size: 36px;
  font-weight: 650;
  letter-spacing: -1px;
}
.summary-total span {
  font-size: 12px;
  color: #94a3b8;
}
.summary-bar {
  display: flex;
  height: 8px;
  gap: 4px;
  margin: 19px 24px 23px;
  border-radius: 8px;
  overflow: hidden;
}
.summary-bar .green,
.legend-dot.green {
  background: #34d399;
}
.summary-bar .blue,
.legend-dot.blue {
  background: #60a5fa;
}
.summary-bar .slate,
.legend-dot.slate {
  background: #cbd5e1;
}
.summary-list {
  display: grid;
  gap: 17px;
  padding: 0 24px 24px;
  font-size: 12px;
}
.summary-list > div {
  display: flex;
  justify-content: space-between;
}
.summary-list span {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #64748b;
}
.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.summary-link {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
}
.quick-section {
  margin-top: 28px;
}
.quick-heading {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 14px;
}
.quick-heading > span {
  font-size: 11px;
  color: #94a3b8;
}
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.quick-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
h3 {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}
.quick-card p {
  font-size: 11px;
  color: #94a3b8;
  margin: 5px 0 0;
}
.quick-arrow {
  margin-left: auto;
  color: #94a3b8;
}
@media (max-width: 1200px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .content-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .quick-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 640px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .metrics {
    grid-template-columns: minmax(0, 1fr);
  }
  .panel-heading {
    padding: 20px 16px;
  }
  .quick-heading {
    flex-wrap: wrap;
  }
  .footer-note {
    display: none;
  }
}
</style>
