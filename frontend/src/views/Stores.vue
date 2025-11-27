<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

const stores = ref([]);
const loading = ref(true);
const showForm = ref(false);
const editingId = ref(null);

const form = ref({
  name: '',
  type: '',
  region: '大安區',
  address: '',
  menuUrl: '',
  menuImageUrl: '',
  uberUrl: '',
  pandaUrl: '',
  isActive: true
});

const fetchStores = async () => {
  try {
    const res = await api.get('/api/stores');
    stores.value = res.data;
  } catch (e) {
    console.error('Failed to fetch stores:', e);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    region: '大安區',
    address: '',
    menuUrl: '',
    menuImageUrl: '',
    uberUrl: '',
    pandaUrl: '',
    isActive: true
  };
  editingId.value = null;
};

const openForm = (store = null) => {
  if (store) {
    editingId.value = store.id;
    form.value = { ...store };
  } else {
    resetForm();
  }
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
};

const saveStore = async () => {
  try {
    if (editingId.value) {
      await api.put(`/api/stores/${editingId.value}`, form.value);
    } else {
      await api.post('/api/stores', form.value);
    }
    closeForm();
    fetchStores();
  } catch (e) {
    alert('儲存失敗：' + (e.response?.data?.error || e.message));
  }
};

const deleteStore = async (id) => {
  if (!confirm('確定要刪除此店家嗎？')) return;
  try {
    await api.delete(`/api/stores/${id}`);
    fetchStores();
  } catch (e) {
    alert('刪除失敗：' + (e.response?.data?.error || e.message));
  }
};

const toggleActive = async (store) => {
  try {
    await api.put(`/api/stores/${store.id}`, { isActive: !store.isActive });
    fetchStores();
  } catch (e) {
    alert('更新失敗');
  }
};

onMounted(fetchStores);
</script>

<template>
  <div>
    <div class="header">
      <h1>飲料店管理</h1>
      <button @click="openForm()">+ 新增店家</button>
    </div>

    <div v-if="loading" class="card">載入中...</div>

    <template v-else>
      <div class="card" v-if="stores.length > 0">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>菜單</th>
                <th>名稱</th>
                <th>類型</th>
                <th>區域</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="store in stores" :key="store.id">
                <td>
                  <div class="menu-thumb" v-if="store.menuImageUrl">
                    <img :src="store.menuImageUrl" :alt="store.name + ' 菜單'" />
                  </div>
                  <span v-else class="no-image">無圖片</span>
                </td>
                <td>{{ store.name }}</td>
                <td>{{ store.type || '-' }}</td>
                <td>{{ store.region }}</td>
                <td>
                  <span
                    :class="['status-badge', store.isActive ? 'active' : 'inactive']"
                    @click="toggleActive(store)"
                    style="cursor: pointer;"
                  >
                    {{ store.isActive ? '啟用' : '停用' }}
                  </span>
                </td>
                <td>
                  <button class="small-btn" @click="openForm(store)">編輯</button>
                  <button class="small-btn danger" @click="deleteStore(store.id)">刪除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" v-else>
        <p>尚無任何店家資料，請新增店家。</p>
      </div>
    </template>

    <!-- Modal Form -->
    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h2>{{ editingId ? '編輯店家' : '新增店家' }}</h2>

        <div class="form-grid">
          <div class="form-group">
            <label>店名 *</label>
            <input v-model="form.name" type="text" placeholder="例：50嵐" required />
          </div>

          <div class="form-group">
            <label>類型</label>
            <input v-model="form.type" type="text" placeholder="例：手搖飲" />
          </div>

          <div class="form-group">
            <label>區域 *</label>
            <select v-model="form.region">
              <option value="大安區">大安區</option>
              <option value="信義區">信義區</option>
              <option value="中山區">中山區</option>
              <option value="松山區">松山區</option>
              <option value="內湖區">內湖區</option>
              <option value="中正區">中正區</option>
              <option value="萬華區">萬華區</option>
              <option value="文山區">文山區</option>
              <option value="南港區">南港區</option>
              <option value="士林區">士林區</option>
              <option value="北投區">北投區</option>
              <option value="大同區">大同區</option>
            </select>
          </div>

          <div class="form-group">
            <label>地址</label>
            <input v-model="form.address" type="text" placeholder="完整地址" />
          </div>

          <!-- 菜單圖片網址 -->
          <div class="form-group full-width">
            <label>菜單圖片網址</label>
            <input v-model="form.menuImageUrl" type="url" placeholder="https://imgur.com/xxx.jpg" />
            <div v-if="form.menuImageUrl" class="image-preview-small">
              <img :src="form.menuImageUrl" alt="菜單預覽" />
            </div>
            <p class="upload-hint">請貼上外部圖片網址（imgur、Google Drive 等）</p>
          </div>

          <div class="form-group full-width">
            <label>菜單連結（選填）</label>
            <input v-model="form.menuUrl" type="url" placeholder="https://..." />
          </div>

          <div class="form-group">
            <label>Uber Eats 連結</label>
            <input v-model="form.uberUrl" type="url" placeholder="https://..." />
          </div>

          <div class="form-group">
            <label>Foodpanda 連結</label>
            <input v-model="form.pandaUrl" type="url" placeholder="https://..." />
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="form.isActive" />
              啟用此店家
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeForm" class="cancel-btn">取消</button>
          <button @click="saveStore">{{ editingId ? '更新' : '新增' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header button {
  background: linear-gradient(135deg, #8fc31e 0%, #7ab316 100%);
  color: #1a1a2e;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(143, 195, 30, 0.3);
  transition: all 0.3s ease;
}
.header button:hover {
  background: linear-gradient(135deg, #7ab316 0%, #659c0f 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(143, 195, 30, 0.4);
}
h1 {
  color: #1a1a2e;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}
h1::before {
  content: '🏪';
  font-size: 32px;
}
.card {
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: none;
  padding: 20px 24px;
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
}
td {
  padding: 14px 12px;
  color: #3e4c59;
}
tr:nth-child(even) td {
  background: #f8fafc;
}
tr:hover td {
  background: #e6f4fc;
}
.menu-thumb {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #f4f5f7, #e5e7eb);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.menu-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-image {
  color: #9aa5b1;
  font-size: 12px;
}
.image-preview-small {
  margin-top: 10px;
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}
.image-preview-small img {
  width: 100%;
  height: auto;
  display: block;
}
.status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.status-badge.active {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
}
.status-badge.inactive {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}
.small-btn {
  padding: 6px 12px;
  font-size: 12px;
  margin-right: 6px;
  border-radius: 6px;
  font-weight: 500;
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  transition: all 0.2s ease;
}
.small-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 141, 212, 0.3);
}
.small-btn.danger {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
}
.small-btn.danger:hover {
  background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
  box-shadow: 0 4px 10px rgba(229, 62, 62, 0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.modal h2 {
  margin-bottom: 24px;
  color: #1a1a2e;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal h2::before {
  content: '✏️';
  font-size: 24px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #3e4c59;
  font-size: 14px;
}
.form-group input[type="text"],
.form-group input[type="url"],
.form-group select {
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
}
.form-group input:focus,
.form-group select:focus {
  border-color: #008dd4;
  box-shadow: 0 0 0 3px rgba(0, 141, 212, 0.15);
  outline: none;
}
.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

/* Image Upload */
.image-upload-area {
  border: 2px dashed #008dd4;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f4fc 100%);
}
.image-upload-area:hover {
  border-color: #8fc31e;
  background: linear-gradient(135deg, #f0fce6 0%, #e6f9e6 100%);
}
.upload-placeholder {
  padding: 30px;
  cursor: pointer;
  color: #008dd4;
  font-weight: 500;
}
.upload-placeholder:hover {
  color: #8fc31e;
}
.image-preview {
  position: relative;
  display: inline-block;
}
.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}
.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e53e3e;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remove-image-btn:hover {
  background: #c53030;
}
.upload-hint {
  font-size: 12px;
  color: #9aa5b1;
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
}
.modal-actions button {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.modal-actions button:not(.cancel-btn) {
  background: linear-gradient(135deg, #008dd4 0%, #0076cc 100%);
  box-shadow: 0 4px 12px rgba(0, 141, 212, 0.3);
}
.modal-actions button:not(.cancel-btn):hover {
  background: linear-gradient(135deg, #0076cc 0%, #005a9e 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 141, 212, 0.4);
}
.cancel-btn {
  background: #e5e7eb;
  color: #3e4c59;
}
.cancel-btn:hover {
  background: #d1d5db;
  color: #1a1a2e;
}
</style>
