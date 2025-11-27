<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const room = ref(null);
const loading = ref(true);
const resetting = ref(false);

const fetchRoom = async () => {
  try {
    const res = await axios.get('/api/room/today');
    room.value = res.data;
  } catch (e) {
    console.error('Failed to fetch room:', e);
  } finally {
    loading.value = false;
  }
};

const resetRoom = async () => {
  if (!confirm('確定要重置今日房間嗎？所有訂單將被刪除！')) return;

  resetting.value = true;
  try {
    const token = localStorage.getItem('token') || '';
    await axios.post('/api/room/reset', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    room.value = null;
    alert('房間已重置');
  } catch (e) {
    alert('重置失敗：' + (e.response?.data?.error || e.message));
  } finally {
    resetting.value = false;
  }
};

onMounted(fetchRoom);
</script>

<template>
  <div>
    <h1>今日飲料房間</h1>

    <div v-if="loading" class="card">載入中...</div>

    <template v-else>
      <div class="card" v-if="room">
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
            <td>狀態</td>
            <td>
              <span :class="['status-badge', room.status]">
                {{ room.status === 'pending_selection' ? '等待選擇' :
                   room.status === 'store_selected' ? '已選定店家' :
                   room.status === 'closed' ? '已關閉' : room.status }}
              </span>
            </td>
          </tr>
          <tr>
            <td>店家</td>
            <td>{{ room.store?.name || '尚未選定' }}</td>
          </tr>
          <tr v-if="room.store?.address">
            <td>地址</td>
            <td>{{ room.store.address }}</td>
          </tr>
          <tr v-if="room.store?.menuUrl">
            <td>菜單</td>
            <td><a :href="room.store.menuUrl" target="_blank">查看菜單</a></td>
          </tr>
          <tr>
            <td>決定者</td>
            <td>{{ room.deciderName || '-' }}</td>
          </tr>
          <tr>
            <td>重抽次數</td>
            <td>{{ room.rerollCount }}</td>
          </tr>
        </table>

        <div class="actions">
          <button @click="resetRoom" :disabled="resetting" class="danger-btn">
            {{ resetting ? '重置中...' : '重置今日房間' }}
          </button>
        </div>
      </div>

      <div class="card" v-else>
        <p>今天還沒有房間資料。</p>
        <p class="hint">等待前台用戶開始抽選飲料店。</p>
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
  content: '🎰';
  font-size: 32px;
}
.card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 24px;
}
.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.status-badge.pending_selection {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}
.status-badge.store_selected {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}
.status-badge.closed {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  color: #374151;
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
  width: 140px;
}
td {
  padding: 14px 16px;
  color: #3e4c59;
}
tr:hover td {
  background: #f8fafc;
}
.actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
  display: flex;
  gap: 12px;
}
.danger-btn {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
  transition: all 0.3s ease;
}
.danger-btn:hover {
  background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(229, 62, 62, 0.4);
}
.danger-btn:disabled {
  background: #9aa5b1;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
.hint {
  color: #9aa5b1;
  font-size: 14px;
  margin-top: 12px;
}
a {
  color: #008dd4;
  font-weight: 500;
}
a:hover {
  color: #8fc31e;
  text-decoration: underline;
}
</style>
