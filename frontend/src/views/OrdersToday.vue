<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api.js';

const orders = ref([]);
const loading = ref(true);
const availableDates = ref([]);
const selectedDate = ref('');

// 取得今天日期字串 (YYYY-MM-DD)
const getTodayString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// 格式化日期顯示
const formatDateDisplay = (dateStr) => {
  const date = new Date(dateStr);
  const today = getTodayString();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];

  if (dateStr === today) {
    return `今天 (${date.getMonth() + 1}/${date.getDate()} 週${weekday})`;
  }
  return `${date.getMonth() + 1}/${date.getDate()} 週${weekday}`;
};

const isToday = computed(() => selectedDate.value === getTodayString());

const fetchAvailableDates = async () => {
  try {
    const res = await api.get('/api/orders/dates');
    availableDates.value = res.data;

    // 如果今天不在列表中，加入今天
    const today = getTodayString();
    if (!availableDates.value.includes(today)) {
      availableDates.value.unshift(today);
    }

    // 預設選擇今天
    selectedDate.value = today;
  } catch (e) {
    console.error('Failed to fetch dates:', e);
    selectedDate.value = getTodayString();
  }
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const url = selectedDate.value
      ? `/api/orders/today?date=${selectedDate.value}`
      : '/api/orders/today';
    const res = await api.get(url);
    orders.value = res.data;
  } catch (e) {
    console.error('Failed to fetch orders:', e);
  } finally {
    loading.value = false;
  }
};

const onDateChange = () => {
  fetchOrders();
};

const formatToppings = (toppings) => {
  if (!toppings) return '-';
  if (Array.isArray(toppings)) return toppings.join(', ');
  try {
    const parsed = JSON.parse(toppings);
    if (Array.isArray(parsed)) return parsed.join(', ');
    return toppings;
  } catch {
    return toppings;
  }
};

onMounted(async () => {
  await fetchAvailableDates();
  await fetchOrders();
});
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ isToday ? '今日訂單' : '歷史訂單' }}</h1>
      <div class="date-selector">
        <label>選擇日期：</label>
        <select v-model="selectedDate" @change="onDateChange">
          <option v-for="date in availableDates" :key="date" :value="date">
            {{ formatDateDisplay(date) }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="card">載入中...</div>

    <template v-else>
      <div class="card summary">
        <span>總計 <strong>{{ orders.length }}</strong> 杯飲料</span>
        <button @click="fetchOrders" class="refresh-btn">重新整理</button>
      </div>

      <div class="card" v-if="orders.length > 0">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>時間</th>
                <th>姓名</th>
                <th>飲料</th>
                <th>甜度</th>
                <th>冰量</th>
                <th>加料</th>
                <th>備註</th>
                <th>店家</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in orders" :key="o.id">
                <td>{{ new Date(o.createdAt).toLocaleTimeString() }}</td>
                <td>{{ o.name }}</td>
                <td>{{ o.drink }}</td>
                <td>{{ o.sweetness }}</td>
                <td>{{ o.iceLevel }}</td>
                <td>{{ formatToppings(o.toppings) }}</td>
                <td>{{ o.notes || '-' }}</td>
                <td>{{ o.store?.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" v-else>
        <p>{{ isToday ? '今天還沒有任何訂單。' : '該日期沒有訂單記錄。' }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
h1 {
  margin: 0;
  color: #1a1a2e;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}
h1::before {
  content: '📝';
  font-size: 32px;
}
.date-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}
.date-selector label {
  font-weight: 600;
  color: #3e4c59;
  font-size: 14px;
}
.date-selector select {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  background: white;
  cursor: pointer;
  min-width: 180px;
  transition: all 0.2s ease;
}
.date-selector select:focus {
  border-color: #008dd4;
  box-shadow: 0 0 0 3px rgba(0, 141, 212, 0.15);
  outline: none;
}
.date-selector select:hover {
  border-color: #008dd4;
}
.card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 20px 24px;
}
.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4fc 100%);
  border-left: 4px solid #008dd4;
}
.summary span {
  font-size: 16px;
  color: #3e4c59;
}
.summary strong {
  font-size: 32px;
  font-weight: 800;
  color: #008dd4;
  margin: 0 4px;
}
.refresh-btn {
  background: linear-gradient(135deg, #8fc31e 0%, #7ab316 100%);
  color: #1a1a2e;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(143, 195, 30, 0.3);
  transition: all 0.3s ease;
}
.refresh-btn:hover {
  background: linear-gradient(135deg, #7ab316 0%, #659c0f 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(143, 195, 30, 0.4);
}
.table-wrapper {
  overflow-x: auto;
}
table {
  border-radius: 12px;
  overflow: hidden;
}
th {
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  color: white;
  font-weight: 600;
  padding: 14px 12px;
  font-size: 13px;
  white-space: nowrap;
}
td {
  padding: 14px 12px;
  color: #3e4c59;
  font-size: 14px;
}
tr:nth-child(even) td {
  background: #f8fafc;
}
tr:hover td {
  background: #e6f4fc;
}
</style>
