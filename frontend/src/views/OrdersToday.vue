<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const orders = ref([]);
const loading = ref(true);

const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token') || '';
    const res = await axios.get('/api/orders/today', {
      headers: { Authorization: `Bearer ${token}` }
    });
    orders.value = res.data;
  } catch (e) {
    console.error('Failed to fetch orders:', e);
  } finally {
    loading.value = false;
  }
};

const formatToppings = (toppings) => {
  if (!toppings) return '-';
  if (Array.isArray(toppings)) return toppings.join(', ');
  return JSON.stringify(toppings);
};

onMounted(fetchOrders);
</script>

<template>
  <div>
    <h1>今日訂單列表</h1>

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
        <p>今天還沒有任何訂單。</p>
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
  content: '📝';
  font-size: 32px;
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
