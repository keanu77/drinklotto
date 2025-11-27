<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const room = ref(null);
const orders = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const roomRes = await axios.get('/api/room/today');
    room.value = roomRes.data;

    const token = localStorage.getItem('token') || '';
    const ordersRes = await axios.get('/api/orders/today', {
      headers: { Authorization: `Bearer ${token}` }
    });
    orders.value = ordersRes.data;
  } catch (e) {
    console.error('Failed to fetch data:', e);
  } finally {
    loading.value = false;
  }
});

const totalOrders = () => orders.value.length;
</script>

<template>
  <div>
    <h1>Dashboard</h1>

    <div v-if="loading" class="card">載入中...</div>

    <template v-else>
      <div class="stats-grid">
        <div class="card stat-card">
          <h3>今日飲料店</h3>
          <p class="stat-value">{{ room?.store?.name || '尚未選定' }}</p>
          <p class="stat-label">狀態：{{ room?.status || '無房間' }}</p>
        </div>

        <div class="card stat-card">
          <h3>今日訂單總數</h3>
          <p class="stat-value">{{ totalOrders() }} 杯</p>
          <p class="stat-label">飲料訂單</p>
        </div>

        <div class="card stat-card">
          <h3>重抽次數</h3>
          <p class="stat-value">{{ room?.rerollCount || 0 }} 次</p>
          <p class="stat-label">今日樂透抽選</p>
        </div>
      </div>

      <div class="card" v-if="room">
        <h3>今日房間詳情</h3>
        <table>
          <tr>
            <th>項目</th>
            <th>內容</th>
          </tr>
          <tr>
            <td>日期</td>
            <td>{{ new Date(room.roomDate).toLocaleDateString() }}</td>
          </tr>
          <tr>
            <td>店家</td>
            <td>{{ room.store?.name || '尚未選定' }}</td>
          </tr>
          <tr>
            <td>決定者</td>
            <td>{{ room.deciderName || '-' }}</td>
          </tr>
          <tr>
            <td>狀態</td>
            <td>{{ room.status }}</td>
          </tr>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 24px;
  color: #1a1a2e;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}
h1::before {
  content: '📊';
  font-size: 32px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}
.stat-card {
  text-align: center;
  padding: 24px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #008dd4, #8fc31e);
}
.stat-card:nth-child(1) { background: linear-gradient(135deg, #e6f4fc 0%, #f0f9ff 100%); }
.stat-card:nth-child(2) { background: linear-gradient(135deg, #f0fce6 0%, #f7fff0 100%); }
.stat-card:nth-child(3) { background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%); }
.stat-card h3 {
  font-size: 13px;
  color: #616e7c;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 6px;
}
.stat-card:nth-child(1) .stat-value { color: #008dd4; }
.stat-card:nth-child(2) .stat-value { color: #8fc31e; }
.stat-card:nth-child(3) .stat-value { color: #f59e0b; }
.stat-label {
  font-size: 12px;
  color: #9aa5b1;
  font-weight: 500;
}
.card h3 {
  color: #1a1a2e;
  font-size: 18px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}
table {
  border-radius: 12px;
  overflow: hidden;
}
th {
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  color: white;
  font-weight: 600;
  padding: 14px 16px;
}
td {
  padding: 14px 16px;
  color: #3e4c59;
}
tr:hover td {
  background: #f8fafc;
}
</style>
