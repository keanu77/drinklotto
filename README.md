# 飲料樂透機 Drink Lottery

辦公室飲料團購系統，透過樂透抽選今日店家，同事可統一下單。

## 功能特色

- 每日樂透抽選飲料店家
- 支援重新抽選功能
- 飲料菜單圖片顯示
- 訂單管理與統計
- 後台管理介面 (店家、訂單、房間管理)
- 支援 Uber Eats / Foodpanda 連結

## 技術架構

- **Frontend**: Vue 3 + Vite + Vue Router
- **Backend**: Express.js + Prisma ORM
- **Database**: MySQL (Zeabur) / SQLite (本地開發)
- **Authentication**: JWT

## 本地開發

### 環境需求

- Node.js >= 18.0.0
- MySQL (或使用 SQLite 本地開發)

### 安裝步驟

1. Clone 專案
```bash
git clone https://github.com/YOUR_USERNAME/drink-lottery.git
cd drink-lottery
```

2. 安裝後端依賴
```bash
cd backend
npm install
cp .env.example .env
# 編輯 .env 設定資料庫連線
```

3. 初始化資料庫
```bash
npx prisma db push
npm run seed
```

4. 啟動後端
```bash
npm run dev
```

5. 安裝前端依賴 (新終端機)
```bash
cd frontend
npm install
cp .env.example .env
```

6. 啟動前端
```bash
npm run dev
```

7. 開啟瀏覽器 http://localhost:5173

### 預設管理員帳號
- 帳號: `admin`
- 密碼: `admin123`

## Zeabur 部署

### 後端部署

1. 在 Zeabur 建立新專案
2. 連接 GitHub Repository
3. 選擇 `backend` 資料夾作為根目錄
4. 新增 MySQL 服務
5. 設定環境變數：
   - `DATABASE_URL`: Zeabur MySQL 連線字串
   - `JWT_SECRET`: 安全的隨機字串 (至少 32 字元)
   - `PORT`: 4000
   - `NODE_ENV`: production
   - `FRONTEND_URL`: 前端部署網址

### 前端部署

1. 在同一專案新增服務
2. 選擇 `frontend` 資料夾
3. 設定環境變數：
   - `VITE_API_URL`: 後端 API 網址

### Zeabur 環境變數範例

**Backend:**
```
DATABASE_URL=mysql://root:xxx@xxx.zeabur.app:3306/drink_lottery
JWT_SECRET=your_very_secure_random_string_here
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.zeabur.app
```

**Frontend:**
```
VITE_API_URL=https://your-backend.zeabur.app
```

## 專案結構

```
drink-lottery/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   ├── uploads/
│   │   └── menus/
│   ├── seed.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   ├── router/
│   │   └── App.vue
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | /api/stores | 取得所有店家 |
| GET | /api/room/today | 取得今日房間狀態 |
| POST | /api/room/lottery | 執行樂透抽選 |
| POST | /api/orders | 新增訂單 |
| GET | /api/admin/orders | 取得所有訂單 (需登入) |
| POST | /api/admin/login | 管理員登入 |

## License

MIT
