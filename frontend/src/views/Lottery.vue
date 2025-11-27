<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

const room = ref(null);
const currentStore = ref(null);
const isSpinning = ref(false);
const hasSelected = ref(false);
const deciderName = ref('');
const showNameInput = ref(false);

const fetchRoom = async () => {
  try {
    const res = await api.get('/api/room/today');
    room.value = res.data;
    if (res.data?.status === 'store_selected') {
      hasSelected.value = true;
      currentStore.value = res.data.store;
    }
  } catch (e) {
    console.error('Failed to fetch room:', e);
  }
};

const spinLottery = async (forceReroll = false) => {
  if (isSpinning.value) return;
  if (hasSelected.value && !forceReroll) return;

  isSpinning.value = true;
  currentStore.value = null;

  // 動畫效果：快速切換店名
  const animationDuration = 3000;
  const intervalTime = 100;
  let elapsed = 0;

  const interval = setInterval(async () => {
    try {
      const res = await api.get('/api/stores/random?region=大安區');
      currentStore.value = res.data;
    } catch (e) {
      // ignore
    }
    elapsed += intervalTime;

    if (elapsed >= animationDuration) {
      clearInterval(interval);
      // 最終抽選結果
      try {
        const res = await api.post('/api/room/lottery', {
          region: '大安區',
          forceReroll: forceReroll
        });
        room.value = { id: res.data.roomId, rerollCount: res.data.rerollCount };
        currentStore.value = res.data.store;
        isSpinning.value = false;
        showNameInput.value = true;
      } catch (e) {
        alert('抽選失敗：' + (e.response?.data?.error || e.message));
        isSpinning.value = false;
      }
    }
  }, intervalTime);
};

const confirmSelection = async () => {
  if (!deciderName.value.trim()) {
    alert('請輸入你的名字');
    return;
  }

  try {
    const res = await api.post('/api/room/select', {
      roomId: room.value.id,
      storeId: currentStore.value.id,
      deciderName: deciderName.value.trim()
    });
    room.value = res.data;
    hasSelected.value = true;
    showNameInput.value = false;
    alert('已確認！今天就喝 ' + currentStore.value.name + ' !');
  } catch (e) {
    alert('確認失敗：' + (e.response?.data?.error || e.message));
  }
};

const reroll = () => {
  showNameInput.value = false;
  currentStore.value = null;
  spinLottery(false);
};

// 重新抽選（已確認後）
const rerollAfterConfirm = () => {
  if (!confirm('確定要重新抽選嗎？這會取消目前選定的店家。')) return;
  hasSelected.value = false;
  showNameInput.value = false;
  currentStore.value = null;
  spinLottery(true); // forceReroll = true
};

onMounted(fetchRoom);
</script>

<template>
  <div class="lottery-container">
    <!-- Header with logo style -->
    <header class="lottery-header">
      <div class="logo-area">
        <div class="logo-icon">
          <span class="icon-cup">🥤</span>
        </div>
        <div class="logo-text">
          <h1>飲料樂透機</h1>
          <p class="tagline">DRINK LOTTERY</p>
        </div>
      </div>
      <p class="subtitle">今天喝什麼？讓命運來決定！</p>
    </header>

    <!-- 已經選定店家 -->
    <div v-if="hasSelected" class="result-card">
      <div class="result-banner">
        <span class="banner-icon">🏆</span>
        <span>今日冠軍店家</span>
      </div>
      <div class="store-name-large">{{ currentStore?.name }}</div>
      <div class="store-details">
        <div class="detail-item" v-if="currentStore?.address">
          <span class="detail-icon">📍</span>
          <span>{{ currentStore.address }}</span>
        </div>
        <div class="detail-item" v-if="room?.deciderName">
          <span class="detail-icon">👤</span>
          <span>由 <strong>{{ room.deciderName }}</strong> 決定</span>
        </div>
      </div>
      <div class="store-links">
        <a v-if="currentStore?.menuUrl" :href="currentStore.menuUrl" target="_blank" class="link-btn">
          📋 菜單
        </a>
        <a v-if="currentStore?.uberUrl" :href="currentStore.uberUrl" target="_blank" class="link-btn uber">
          🚗 Uber Eats
        </a>
        <a v-if="currentStore?.pandaUrl" :href="currentStore.pandaUrl" target="_blank" class="link-btn panda">
          🐼 Foodpanda
        </a>
      </div>
      <div class="action-buttons">
        <router-link to="/order" class="order-btn">
          <span class="btn-icon">🛒</span>
          <span>我要跟單</span>
        </router-link>
        <button @click="rerollAfterConfirm" class="reroll-after-btn">
          <span class="btn-icon">🎰</span>
          <span>重新抽選</span>
        </button>
      </div>
      <p class="reroll-hint" v-if="room?.rerollCount > 0">
        已重抽 {{ room.rerollCount }} 次
      </p>
    </div>

    <!-- 抽選中 / 尚未選定 -->
    <div v-else class="lottery-machine">
      <div class="machine-frame">
        <div class="machine-top">
          <div class="light" :class="{ active: isSpinning }"></div>
          <div class="light" :class="{ active: isSpinning }"></div>
          <div class="light" :class="{ active: isSpinning }"></div>
        </div>
        <div class="slot-display" :class="{ spinning: isSpinning }">
          <span v-if="currentStore" class="store-text">{{ currentStore.name }}</span>
          <span v-else class="placeholder">？？？</span>
        </div>
        <div class="machine-bottom">
          <div class="stripe"></div>
          <div class="stripe"></div>
          <div class="stripe"></div>
        </div>
      </div>

      <!-- 輸入名字確認 -->
      <div v-if="showNameInput" class="confirm-section">
        <div class="confirm-card">
          <p class="confirm-title">抽到了！</p>
          <p class="confirm-store">{{ currentStore?.name }}</p>
          <div class="name-input">
            <label>請輸入你的名字</label>
            <input
              v-model="deciderName"
              type="text"
              placeholder="你的名字"
              @keyup.enter="confirmSelection"
            />
          </div>
          <div class="confirm-buttons">
            <button @click="confirmSelection" class="confirm-btn">
              ✓ 就決定是你了！
            </button>
            <button @click="reroll" class="reroll-btn">
              ↻ 再抽一次
            </button>
          </div>
          <p class="reroll-count">已重抽 {{ room?.rerollCount || 0 }} 次</p>
        </div>
      </div>

      <!-- 開始抽選按鈕 -->
      <button
        v-else
        @click="spinLottery"
        :disabled="isSpinning"
        class="spin-btn"
      >
        <span v-if="isSpinning" class="spinning-text">抽選中...</span>
        <span v-else>
          <span class="btn-icon">🎰</span>
          <span>開始抽選</span>
        </span>
      </button>
    </div>

    <footer class="lottery-footer">
      <router-link to="/login">後台管理</router-link>
    </footer>
  </div>
</template>

<style scoped>
.lottery-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 50%, #005a9e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

/* 背景動態效果 */
.lottery-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255,255,255,0.03) 10px,
    rgba(255,255,255,0.03) 20px
  );
  animation: moveStripes 20s linear infinite;
}

@keyframes moveStripes {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Header */
.lottery-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.logo-icon {
  width: 70px;
  height: 70px;
  background: #8fc31e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(143, 195, 30, 0.4);
}

.icon-cup {
  font-size: 36px;
}

.logo-text h1 {
  font-size: 42px;
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.tagline {
  font-size: 14px;
  letter-spacing: 4px;
  opacity: 0.9;
  margin-top: 4px;
}

.subtitle {
  font-size: 18px;
  opacity: 0.9;
}

/* 抽獎機 */
.lottery-machine {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.machine-frame {
  background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 20px 60px rgba(0,0,0,0.3),
    inset 0 2px 0 rgba(255,255,255,0.8);
  border: 4px solid #8fc31e;
}

.machine-top {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 15px;
}

.light {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s;
}

.light.active {
  background: #8fc31e;
  box-shadow: 0 0 15px #8fc31e;
  animation: blink 0.3s infinite alternate;
}

@keyframes blink {
  0% { opacity: 1; }
  100% { opacity: 0.5; }
}

.slot-display {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 30px 50px;
  min-width: 280px;
  text-align: center;
  border: 3px solid #008dd4;
  box-shadow: inset 0 4px 20px rgba(0,0,0,0.5);
}

.slot-display.spinning {
  animation: shake 0.1s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

.store-text {
  font-size: 42px;
  font-weight: 700;
  color: #8fc31e;
  text-shadow: 0 0 20px rgba(143, 195, 30, 0.5);
}

.placeholder {
  font-size: 42px;
  font-weight: 700;
  color: #4a5568;
}

.machine-bottom {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.stripe {
  width: 60px;
  height: 8px;
  background: linear-gradient(90deg, #008dd4, #8fc31e);
  border-radius: 4px;
}

/* 抽選按鈕 */
.spin-btn {
  margin-top: 30px;
  font-size: 22px;
  padding: 18px 50px;
  background: linear-gradient(135deg, #8fc31e 0%, #7ab315 100%);
  border: none;
  border-radius: 50px;
  color: #1a1a2e;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(143, 195, 30, 0.4);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.spin-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(143, 195, 30, 0.5);
  background: linear-gradient(135deg, #9dd42a 0%, #8fc31e 100%);
}

.spin-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 26px;
}

.spinning-text {
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 確認區塊 */
.confirm-section {
  margin-top: 30px;
}

.confirm-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  border-top: 5px solid #8fc31e;
}

.confirm-title {
  font-size: 18px;
  color: #4B4F58;
  margin-bottom: 8px;
}

.confirm-store {
  font-size: 32px;
  font-weight: 700;
  color: #008dd4;
  margin-bottom: 20px;
}

.name-input {
  margin-bottom: 20px;
}

.name-input label {
  display: block;
  font-size: 14px;
  color: #4B4F58;
  margin-bottom: 8px;
}

.name-input input {
  font-size: 16px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  max-width: 250px;
}

.name-input input:focus {
  border-color: #008dd4;
  outline: none;
}

.confirm-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.confirm-btn {
  font-size: 16px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #8fc31e 0%, #7ab315 100%);
  color: #1a1a2e;
  border-radius: 8px;
  font-weight: 600;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #9dd42a 0%, #8fc31e 100%);
}

.reroll-btn {
  font-size: 16px;
  padding: 14px 28px;
  background: #e0e0e0;
  color: #4B4F58;
  border-radius: 8px;
  font-weight: 600;
}

.reroll-btn:hover {
  background: #d0d0d0;
  color: #3a3a3a;
}

.reroll-count {
  font-size: 13px;
  color: #9aa5b1;
  margin-top: 15px;
}

/* 結果卡片 */
.result-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  max-width: 420px;
  width: 100%;
  position: relative;
  z-index: 1;
  border-top: 6px solid #8fc31e;
}

.result-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.banner-icon {
  font-size: 18px;
}

.store-name-large {
  font-size: 48px;
  font-weight: 700;
  color: #3a3a3a;
  margin-bottom: 20px;
  line-height: 1.2;
}

.store-details {
  margin-bottom: 25px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4B4F58;
  margin-bottom: 8px;
}

.detail-icon {
  font-size: 16px;
}

.store-links {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 25px;
}

.link-btn {
  padding: 10px 18px;
  background: #f4f5f7;
  border-radius: 8px;
  color: #3a3a3a;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.link-btn:hover {
  background: #e5e7eb;
  color: #3a3a3a;
}

.link-btn.uber {
  background: #06c167;
  color: white;
}

.link-btn.uber:hover {
  background: #05a857;
  color: white;
}

.link-btn.panda {
  background: #d70f64;
  color: white;
}

.link-btn.panda:hover {
  background: #c00d5a;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.order-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  border-radius: 50px;
  color: white;
  font-weight: 700;
  transition: all 0.3s;
  box-shadow: 0 8px 25px rgba(0, 141, 212, 0.3);
}

.order-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(0, 141, 212, 0.4);
  background: linear-gradient(135deg, #8fc31e 0%, #7ab315 100%);
  color: #1a1a2e;
}

.reroll-after-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 50px;
  color: white;
  font-weight: 700;
  transition: all 0.3s;
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
  border: none;
  cursor: pointer;
}

.reroll-after-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(245, 158, 11, 0.4);
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.reroll-hint {
  font-size: 13px;
  color: #9aa5b1;
  margin-top: 5px;
}

/* Footer */
.lottery-footer {
  margin-top: auto;
  padding-top: 40px;
  position: relative;
  z-index: 1;
}

.lottery-footer a {
  color: rgba(255,255,255,0.6);
  font-size: 14px;
}

.lottery-footer a:hover {
  color: #8fc31e;
}
</style>
