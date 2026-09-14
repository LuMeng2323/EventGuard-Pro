<template>
  <el-container class="layout">
    <el-aside width="220px" class="sidebar">
      <div class="logo">EventGuard Pro</div>

      <el-menu
        router
        :default-active="$route.path"
      >
        <el-menu-item index="/">
          Dashboard
        </el-menu-item>

        <el-menu-item index="/events">
          Event Management
        </el-menu-item>

        <el-menu-item index="/staff">
          Staff Management
        </el-menu-item>

        <el-menu-item index="/schedule">
          Schedule Management
        </el-menu-item>

        <el-menu-item index="/deployment">
          Security Deployment
        </el-menu-item>

        <el-menu-item index="/cost">
          Cost Management
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        EventGuard Pro
      </el-header>

      <el-main>
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.sidebar {
  border-right: 1px solid #eee;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 18px;
  font-weight: 600;
}

.header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}
</style>