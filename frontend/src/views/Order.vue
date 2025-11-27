<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const room = ref(null);
const loading = ref(true);
const submitting = ref(false);
const submitted = ref(false);
const showMenuImage = ref(false);

const form = ref({
  name: '',
  drink: '',
  sweetness: '正常糖',
  iceLevel: '正常冰',
  toppings: [],
  notes: ''
});

const sweetnessOptions = ['無糖', '一分糖', '三分糖', '半糖', '七分糖', '正常糖'];
const iceOptions = ['熱飲', '溫', '去冰', '微冰', '少冰', '正常冰'];
const toppingOptions = ['珍珠', '椰果', '仙草', '布丁', '芋圓', '粉條', '蘆薈', '寒天'];

const fetchRoom = async () => {
  try {
    const res = await axios.get('/api/room/today');
    room.value = res.data;
    if (!res.data || res.data.status !== 'store_selected') {
      // 尚未選定店家，導回樂透頁
      router.push('/lottery');
    }
  } catch (e) {
    console.error('Failed to fetch room:', e);
    router.push('/lottery');
  } finally {
    loading.value = false;
  }
};

const toggleTopping = (topping) => {
  const idx = form.value.toppings.indexOf(topping);
  if (idx === -1) {
    form.value.toppings.push(topping);
  } else {
    form.value.toppings.splice(idx, 1);
  }
};

const submitOrder = async () => {
  if (!form.value.name.trim()) {
    alert('請輸入你的名字');
    return;
  }
  if (!form.value.drink.trim()) {
    alert('請輸入飲料名稱');
    return;
  }

  submitting.value = true;
  try {
    await axios.post('/api/orders', {
      roomId: room.value.id,
      storeId: room.value.storeId,
      name: form.value.name.trim(),
      drink: form.value.drink.trim(),
      sweetness: form.value.sweetness,
      iceLevel: form.value.iceLevel,
      toppings: form.value.toppings,
      notes: form.value.notes.trim()
    });
    submitted.value = true;
  } catch (e) {
    alert('訂單送出失敗：' + (e.response?.data?.error || e.message));
  } finally {
    submitting.value = false;
  }
};

const orderAnother = () => {
  form.value = {
    name: form.value.name, // 保留名字
    drink: '',
    sweetness: '正常糖',
    iceLevel: '正常冰',
    toppings: [],
    notes: ''
  };
  submitted.value = false;
};

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/400x600?text=菜單圖片載入失敗';
};

onMounted(fetchRoom);
</script>

<template>
  <div class="order-container">
    <header class="order-header">
      <router-link to="/lottery" class="back-link">← 返回樂透機</router-link>
      <h1>🛒 跟單點餐</h1>
    </header>

    <div v-if="loading" class="loading">載入中...</div>

    <template v-else-if="room">
      <!-- 店家資訊 -->
      <div class="store-info-card">
        <div class="store-badge">今日店家</div>
        <div class="store-name">{{ room.store?.name }}</div>
        <div class="store-actions">
          <button
            v-if="room.store?.menuImageUrl"
            @click="showMenuImage = !showMenuImage"
            class="menu-toggle-btn"
          >
            {{ showMenuImage ? '🔼 收起菜單' : '📋 查看菜單圖片' }}
          </button>
          <a v-if="room.store?.menuUrl" :href="room.store.menuUrl" target="_blank" class="menu-link">
            🔗 官方菜單連結
          </a>
        </div>
      </div>

      <!-- 菜單圖片 -->
      <div v-if="showMenuImage && room.store?.menuImageUrl" class="menu-image-card">
        <div class="menu-image-header">
          <h3>{{ room.store.name }} 菜單</h3>
          <button @click="showMenuImage = false" class="close-btn">✕</button>
        </div>
        <div class="menu-image-wrapper">
          <img
            :src="room.store.menuImageUrl"
            :alt="room.store.name + ' 菜單'"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- 送出成功 -->
      <div v-if="submitted" class="success-card">
        <div class="success-icon">✅</div>
        <h2>訂單已送出！</h2>
        <div class="order-summary">
          <p><strong>{{ form.name }}</strong> 點了</p>
          <p class="drink-name">{{ form.drink }}</p>
          <p>{{ form.sweetness }} / {{ form.iceLevel }}</p>
          <p v-if="form.toppings.length">加料：{{ form.toppings.join('、') }}</p>
          <p v-if="form.notes">備註：{{ form.notes }}</p>
        </div>
        <button @click="orderAnother" class="another-btn">再點一杯</button>
        <router-link to="/lottery" class="back-btn">返回樂透機</router-link>
      </div>

      <!-- 點餐表單 -->
      <div v-else class="order-form">
        <div class="form-group">
          <label>你的名字 *</label>
          <input v-model="form.name" type="text" placeholder="請輸入名字" />
        </div>

        <div class="form-group">
          <label>飲料名稱 *</label>
          <input v-model="form.drink" type="text" placeholder="例：珍珠奶茶" />
        </div>

        <div class="form-group">
          <label>甜度</label>
          <div class="option-group">
            <button
              v-for="opt in sweetnessOptions"
              :key="opt"
              :class="['option-btn', { active: form.sweetness === opt }]"
              @click="form.sweetness = opt"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>冰量</label>
          <div class="option-group">
            <button
              v-for="opt in iceOptions"
              :key="opt"
              :class="['option-btn', { active: form.iceLevel === opt }]"
              @click="form.iceLevel = opt"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>加料（可複選）<span class="label-hint">依店家菜單為主</span></label>
          <div class="option-group">
            <button
              v-for="opt in toppingOptions"
              :key="opt"
              :class="['option-btn', { active: form.toppings.includes(opt) }]"
              @click="toggleTopping(opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>備註</label>
          <textarea v-model="form.notes" placeholder="其他需求（選填）" rows="2"></textarea>
        </div>

        <button
          @click="submitOrder"
          :disabled="submitting"
          class="submit-btn"
        >
          {{ submitting ? '送出中...' : '✅ 送出訂單' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.order-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 50%, #005a9e 100%);
  padding: 20px;
  position: relative;
}

.order-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255,255,255,0.02) 10px,
    rgba(255,255,255,0.02) 20px
  );
  pointer-events: none;
}

.order-header {
  text-align: center;
  color: white;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.back-link {
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.back-link:hover {
  color: #8fc31e;
}

.order-header h1 {
  font-size: 32px;
  margin-top: 10px;
  font-weight: 700;
}

.loading {
  text-align: center;
  color: white;
  font-size: 18px;
  padding: 40px;
  position: relative;
  z-index: 1;
}

.store-info-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  margin-bottom: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
  border-top: 5px solid #8fc31e;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.store-badge {
  display: inline-block;
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.store-name {
  font-size: 32px;
  font-weight: 700;
  color: #3a3a3a;
}

.store-links {
  margin-top: 10px;
}

.store-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 18px;
}

.menu-toggle-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #8fc31e 0%, #7ab315 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(143, 195, 30, 0.3);
}

.menu-link {
  display: inline-block;
  padding: 12px 24px;
  background: #f4f5f7;
  border-radius: 8px;
  color: #008dd4;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.menu-link:hover {
  background: #e5e7eb;
  color: #008dd4;
}

/* 菜單圖片卡片 */
.menu-image-card {
  background: white;
  border-radius: 16px;
  margin-bottom: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
}

.menu-image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  color: white;
}

.menu-image-header h3 {
  margin: 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  font-size: 18px;
  color: white;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255,255,255,0.3);
  color: white;
}

.menu-image-wrapper {
  padding: 15px;
  max-height: 60vh;
  overflow-y: auto;
}

.menu-image-wrapper img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

.order-form {
  background: white;
  border-radius: 16px;
  padding: 28px;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #3a3a3a;
  margin-bottom: 10px;
  font-size: 15px;
}

.label-hint {
  font-weight: 400;
  font-size: 12px;
  color: #9aa5b1;
  margin-left: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #008dd4;
  outline: none;
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.option-btn {
  padding: 10px 18px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  background: white;
  color: #4B4F58;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn:hover {
  border-color: #008dd4;
  color: #008dd4;
}

.option-btn.active {
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  border-color: #008dd4;
  color: white;
}

.submit-btn {
  width: 100%;
  padding: 18px;
  font-size: 18px;
  background: linear-gradient(135deg, #8fc31e 0%, #7ab315 100%);
  border: none;
  border-radius: 10px;
  color: #1a1a2e;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(143, 195, 30, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(143, 195, 30, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 成功畫面 */
.success-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  border-top: 5px solid #8fc31e;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-card h2 {
  color: #8fc31e;
  margin-bottom: 20px;
  font-weight: 700;
}

.order-summary {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #008dd4;
}

.order-summary .drink-name {
  font-size: 26px;
  font-weight: 700;
  color: #008dd4;
  margin: 10px 0;
}

.another-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  background: linear-gradient(135deg, #8fc31e 0%, #7ab315 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.another-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(143, 195, 30, 0.3);
}

.back-btn {
  display: block;
  color: #008dd4;
  font-size: 14px;
  margin-top: 10px;
  font-weight: 500;
}

.back-btn:hover {
  color: #8fc31e;
}
</style>
