<script setup lang="ts">
const route = useRoute();
const pageTitle = computed(() => route.meta.title || "EventGuard Pro");
const collapsed = ref(false);
const navigation = [
  { path: "/meals", label: "Meal Report", icon: "M4 3v7a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-4 0-5 9 0 9" },
  {
    path: "/",
    label: "Dashboard",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  },
  {
    path: "/events",
    label: "Event Management",
    icon: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  },
  {
    path: "/staff",
    label: "Staff Management",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  },
  {
    path: "/schedule",
    label: "Schedule Management",
    icon: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  },
  {
    path: "/deployment",
    label: "Security Deployment",
    icon: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-4-11 3 3 5-5",
  },
  {
    path: "/cost",
    label: "Cost Management",
    icon: "M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6m18 7h-5v4h5",
  },
];
</script>

<template>
  <el-container class="app-shell" :class="{ 'sidebar-collapsed': collapsed }">
    <el-aside class="app-sidebar" width="248px">
      <NuxtLink to="/" class="brand" aria-label="EventGuard Pro home">
        <span class="brand-mark">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-4-11 3 3 5-5"
            />
          </svg>
        </span>
        <span class="brand-copy"
          ><strong>EventGuard <small>PRO</small></strong
          ><span>Security operations</span></span
        >
      </NuxtLink>

      <nav
        id="main-navigation"
        class="sidebar-navigation"
        aria-label="Main navigation"
      >
        <div class="navigation-label">WORKSPACE</div>
        <el-menu router :default-active="route.path" class="navigation-menu">
          <el-menu-item
            v-for="item in navigation"
            :key="item.path"
            :index="item.path"
            :title="item.label"
            :aria-label="item.label"
            :aria-current="route.path === item.path ? 'page' : undefined"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="item.icon" />
            </svg>
            <span class="navigation-text">{{ item.label }}</span>
            <span
              v-if="route.path === item.path"
              class="active-dot"
              aria-hidden="true"
            />
          </el-menu-item>
        </el-menu>
      </nav>

      <div class="sidebar-footer">
        <span class="workspace-avatar" aria-hidden="true">EG</span>
        <div class="workspace-copy">
          <strong>EventGuard workspace</strong
          ><span>Operations management</span>
        </div>
      </div>
    </el-aside>

    <el-container class="app-content">
      <el-header class="app-header" height="76px">
        <div class="header-leading">
          <button
            class="sidebar-toggle"
            type="button"
            :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            :aria-expanded="!collapsed"
            aria-controls="main-navigation"
            :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            @click="collapsed = !collapsed"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <path d="M9 4v16" />
            </svg>
          </button>
          <div class="header-titles">
            <div class="header-breadcrumb">
              <NuxtLink to="/">Workspace</NuxtLink
              ><span aria-hidden="true">/</span><span>{{ pageTitle }}</span>
            </div>
            <div class="header-page-title">{{ pageTitle }}</div>
          </div>
        </div>
        <div class="header-context">
          <span class="header-context-icon" aria-hidden="true"
            ><svg viewBox="0 0 24 24">
              <path
                d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-4-11 3 3 5-5"
              /></svg></span
          ><span>Security operations</span>
        </div>
      </el-header>
      <el-main class="app-main"><slot /></el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  color: #1e293b;
  --el-color-primary: #2563eb;
}
svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}
a {
  text-decoration: none;
  color: inherit;
}
a:focus-visible,
button:focus-visible {
  outline: 3px solid #93c5fd;
  outline-offset: 3px;
}
.app-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e5eaf0;
  transition: width 0.2s;
  overflow-x: hidden;
}
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 76px;
  padding: 0 22px;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}
.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 37px;
  height: 40px;
  color: #fff;
  background: #2563eb;
  border-radius: 11px;
  box-shadow: 0 4px 10px #2563eb24;
}
.brand-mark svg {
  width: 23px;
  height: 23px;
}
.brand-copy {
  display: grid;
  gap: 3px;
}
.brand-copy strong {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.brand-copy small {
  margin-left: 3px;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 3px 4px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 4px;
  vertical-align: middle;
}
.brand-copy > span {
  font-size: 10px;
  color: #94a3b8;
}
.sidebar-navigation {
  flex: 1;
  padding: 29px 13px;
}
.navigation-label {
  padding: 0 13px;
  margin-bottom: 13px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.6px;
  color: #94a3b8;
}
.navigation-menu {
  border: 0;
  --el-menu-hover-bg-color: #f8fafc;
}
.navigation-menu .el-menu-item {
  height: 45px;
  line-height: 45px;
  margin-bottom: 6px;
  padding: 0 13px !important;
  gap: 12px;
  color: #64748b;
  font-size: 12px;
  border-radius: 9px;
}
.navigation-menu .el-menu-item.is-active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}
.navigation-menu .el-menu-item:hover {
  color: #2563eb;
}
.active-dot {
  margin-left: auto;
  width: 5px;
  height: 5px;
  background: #3b82f6;
  border-radius: 50%;
}
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 17px;
  padding: 20px 0;
  border-top: 1px solid #edf1f6;
  white-space: nowrap;
}
.workspace-avatar {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e5eaf0;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
}
.workspace-copy {
  display: grid;
  gap: 4px;
}
.workspace-copy strong {
  font-size: 11px;
  font-weight: 600;
}
.workspace-copy span {
  font-size: 10px;
  color: #94a3b8;
}
.app-content {
  min-width: 0;
  flex-direction: column;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 30px;
  background: white;
  border-bottom: 1px solid #e5eaf0;
}
.header-leading {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid #e5eaf0;
  background: white;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  flex-shrink: 0;
}
.sidebar-toggle:hover {
  color: #2563eb;
  background: #eff6ff;
  border-color: #bfdbfe;
}
.header-titles {
  min-width: 0;
}
.header-breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 4px;
}
.header-breadcrumb > span:last-child {
  color: #64748b;
}
.header-page-title {
  font-size: 15px;
  font-weight: 650;
  color: #334155;
}
.header-context {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}
.header-context-icon {
  color: #64748b;
  display: flex;
}
.header-context-icon svg {
  width: 16px;
  height: 16px;
}
.app-main {
  min-width: 0;
  padding: 28px 30px;
  background: #f8fafc;
}
.sidebar-collapsed .app-sidebar {
  width: 76px;
}
.sidebar-collapsed .brand {
  padding: 0;
  justify-content: center;
}
.sidebar-collapsed .brand-copy,
.sidebar-collapsed .navigation-label,
.sidebar-collapsed .navigation-text,
.sidebar-collapsed .active-dot,
.sidebar-collapsed .workspace-copy {
  display: none;
}
.sidebar-collapsed .navigation-menu .el-menu-item {
  justify-content: center;
  padding: 0 !important;
}
.sidebar-collapsed .sidebar-footer {
  justify-content: center;
}
@media (max-width: 900px) {
  .app-sidebar {
    width: 76px;
  }
  .brand {
    padding: 0;
    justify-content: center;
  }
  .brand-copy,
  .navigation-label,
  .navigation-text,
  .active-dot,
  .workspace-copy {
    display: none;
  }
  .navigation-menu .el-menu-item {
    justify-content: center;
    padding: 0 !important;
  }
  .sidebar-footer {
    justify-content: center;
  }
  .sidebar-toggle {
    display: none;
  }
  .app-header {
    padding: 0 20px;
  }
  .app-main {
    padding: 22px 20px;
  }
}
@media (max-width: 600px) {
  .header-context {
    display: none;
  }
  .header-breadcrumb {
    font-size: 9px;
    gap: 5px;
  }
  .header-page-title {
    font-size: 13px;
  }
  .app-header {
    padding: 0 14px;
  }
  .app-main {
    padding: 18px 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-sidebar {
    transition: none;
  }
}
</style>
