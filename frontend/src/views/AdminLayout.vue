<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🥤</span>
          <div class="logo-text">
            <span class="logo-title">飲料樂透機</span>
            <span class="logo-subtitle">管理後台</span>
          </div>
        </div>
      </div>
      <nav>
        <router-link to="/admin">
          <span class="nav-icon">📊</span>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/admin/room-today">
          <span class="nav-icon">🎰</span>
          <span>今日飲料房間</span>
        </router-link>
        <router-link to="/admin/orders-today">
          <span class="nav-icon">📝</span>
          <span>今日訂單</span>
        </router-link>
        <router-link to="/admin/stores">
          <span class="nav-icon">🏪</span>
          <span>飲料店管理</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/" class="back-to-front">
          <span class="nav-icon">🏠</span>
          <span>回到前台</span>
        </router-link>
        <button @click="logout" class="logout-btn">
          <span class="nav-icon">🚪</span>
          <span>登出</span>
        </button>
      </div>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #0076cc 0%, #005a9e 100%);
  color: white;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 15px rgba(0,0,0,0.1);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  background: #8fc31e;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 16px;
  font-weight: 700;
}

.logo-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.sidebar nav {
  flex: 1;
  padding: 20px 12px;
}

.sidebar nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255,255,255,0.85);
  margin: 4px 0;
  padding: 14px 16px;
  border-radius: 10px;
  transition: all 0.2s;
  font-weight: 500;
}

.sidebar nav a:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.sidebar nav a.router-link-active {
  background: #8fc31e;
  color: #1a1a2e;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(143, 195, 30, 0.3);
}

.nav-icon {
  font-size: 18px;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.back-to-front {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255,255,255,0.7);
  padding: 12px 16px;
  border-radius: 10px;
  transition: all 0.2s;
  font-size: 14px;
  margin-bottom: 8px;
}

.back-to-front:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(229, 62, 62, 0.9);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #e53e3e;
  transform: translateY(-1px);
}

.content {
  flex: 1;
  padding: 30px;
  background: #f4f5f7;
  overflow-y: auto;
}
</style>
