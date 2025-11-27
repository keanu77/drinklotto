<script setup>
import { ref } from 'vue';
import api from '../api.js';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const login = async () => {
  error.value = '';
  try {
    const res = await api.post('/api/admin/login', {
      username: username.value,
      password: password.value
    });
    localStorage.setItem('admin_token', res.data.token);
    router.push('/admin');
  } catch (e) {
    error.value = '帳號或密碼錯誤';
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <span class="logo-icon">🥤</span>
        <h2>飲料樂透機</h2>
        <span class="subtitle">管理後台登入</span>
      </div>
      <div class="form-group">
        <label>帳號</label>
        <input v-model="username" type="text" placeholder="請輸入帳號" />
      </div>
      <div class="form-group">
        <label>密碼</label>
        <input v-model="password" type="password" placeholder="請輸入密碼" @keyup.enter="login" />
      </div>
      <button @click="login" class="login-btn">登入</button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
    <div class="brand-footer">
      <span>聯新運醫風格</span>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 50%, #005a9e 100%);
  position: relative;
  overflow: hidden;
}
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(143, 195, 30, 0.15) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}
.login-container::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -30%;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}
.login-card {
  background: white;
  padding: 48px 40px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}
.logo {
  text-align: center;
  margin-bottom: 36px;
}
.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #8fc31e 0%, #7ab316 100%);
  border-radius: 20px;
  font-size: 36px;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(143, 195, 30, 0.4);
}
.login-card h2 {
  text-align: center;
  margin-bottom: 8px;
  color: #1a1a2e;
  font-size: 26px;
  font-weight: 800;
}
.subtitle {
  display: block;
  color: #616e7c;
  font-size: 14px;
  font-weight: 500;
}
.form-group {
  margin-bottom: 22px;
}
.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #3e4c59;
  font-size: 14px;
}
.form-group input {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s ease;
}
.form-group input:focus {
  border-color: #008dd4;
  box-shadow: 0 0 0 4px rgba(0, 141, 212, 0.15);
  outline: none;
}
.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  margin-top: 12px;
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(0, 141, 212, 0.4);
  transition: all 0.3s ease;
}
.login-btn:hover {
  background: linear-gradient(135deg, #8fc31e 0%, #7ab316 100%);
  color: #1a1a2e;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(143, 195, 30, 0.5);
}
.error {
  color: #e53e3e;
  text-align: center;
  margin-top: 18px;
  font-weight: 500;
  padding: 10px;
  background: #fee2e2;
  border-radius: 8px;
}
.brand-footer {
  position: absolute;
  bottom: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  z-index: 1;
}
</style>
