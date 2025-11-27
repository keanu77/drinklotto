# 飲料樂透機 (Drink Lottery)

## 專案簡介
辦公室飲料團購樂透系統，每天隨機抽選一家飲料店，同事可線上跟單。

## 專案結構
```
drink-lottery/
├── backend/         # Express + Prisma 後端 API
├── frontend/        # Vue 3 + Vite 管理後台
└── prisma/          # Prisma schema
```

## 技術棧
- **後端**: Express.js, Prisma ORM, MySQL, JWT 認證
- **前端**: Vue 3, Vite, Vue Router, Axios

## 開發指令

### 後端
```bash
cd backend
npm install
# 設定 .env (複製 .env.example)
npx prisma generate
npx prisma migrate dev
npm run seed         # 建立測試資料與管理員帳號
npm run dev          # 啟動開發伺服器 (port 4000)
```

### 前端
```bash
cd frontend
npm install
npm run dev          # 啟動開發伺服器 (port 5173)
```

## 預設管理員
- 帳號: `admin`
- 密碼: `admin123`

## API 端點

### 公開 API
- `GET /api/health` - 健康檢查
- `GET /api/room/today` - 取得今日房間
- `POST /api/room/lottery` - 抽選飲料店
- `POST /api/room/select` - 確認選定店家
- `GET /api/stores/random` - 隨機取得一家店
- `POST /api/orders` - 建立訂單

### 需認證 API
- `POST /api/admin/login` - 管理員登入
- `GET /api/admin/me` - 取得目前管理員資訊
- `GET /api/stores` - 取得所有店家
- `POST /api/stores` - 新增店家
- `PUT /api/stores/:id` - 更新店家
- `DELETE /api/stores/:id` - 刪除店家
- `GET /api/orders/today` - 取得今日訂單
- `POST /api/room/reset` - 重置今日房間

## 資料模型
- **Store**: 飲料店資料
- **DrinkRoom**: 每日房間 (一天一筆)
- **Order**: 飲料訂單
- **Admin**: 管理員帳號

## 部署
使用 Zeabur 部署：
1. 建立 MySQL 資料庫
2. 部署 backend (設定 DATABASE_URL, JWT_SECRET)
3. 部署 frontend (設定 API proxy 或環境變數)
