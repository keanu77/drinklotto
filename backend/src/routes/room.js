import express from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// utility：取得當日 00:00
function getTodayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// GET /api/room/today
router.get('/today', async (req, res) => {
  const today = getTodayDate();
  const room = await prisma.drinkRoom.findFirst({
    where: { roomDate: today },
    include: { store: true }
  });

  res.json(room || null);
});

// POST /api/room/lottery  （抽店）
router.post('/lottery', async (req, res) => {
  const region = req.body.region || '大安區';
  const forceReroll = req.body.forceReroll || false; // 是否強制重抽

  const today = getTodayDate();
  let room = await prisma.drinkRoom.findFirst({ where: { roomDate: today } });

  if (!room) {
    room = await prisma.drinkRoom.create({
      data: {
        roomDate: today,
        status: 'pending_selection'
      }
    });
  }

  // 如果已選定但要強制重抽，先重置狀態
  if (room.status === 'store_selected' && forceReroll) {
    room = await prisma.drinkRoom.update({
      where: { id: room.id },
      data: {
        status: 'pending_selection',
        storeId: null,
        deciderName: null
      }
    });
  } else if (room.status !== 'pending_selection' && !forceReroll) {
    return res.status(400).json({ error: 'Room already selected store' });
  }

  const stores = await prisma.store.findMany({
    where: { isActive: true, region }
  });

  if (stores.length === 0) return res.status(404).json({ error: 'No stores found' });

  const randomStore = stores[Math.floor(Math.random() * stores.length)];

  // 只增加 rerollCount，不馬上鎖定 store
  await prisma.drinkRoom.update({
    where: { id: room.id },
    data: { rerollCount: room.rerollCount + 1 }
  });

  res.json({ roomId: room.id, store: randomStore, rerollCount: room.rerollCount + 1 });
});

// POST /api/room/select   { roomId, storeId, deciderName }
router.post('/select', async (req, res) => {
  const { roomId, storeId, deciderName } = req.body;

  const room = await prisma.drinkRoom.update({
    where: { id: roomId },
    data: {
      storeId,
      status: 'store_selected',
      deciderName
    },
    include: { store: true }
  });

  res.json(room);
});

// POST /api/room/reset  （管理員手動重置）
router.post('/reset', authMiddleware, async (req, res) => {
  const today = getTodayDate();

  await prisma.order.deleteMany({
    where: {
      room: {
        roomDate: today
      }
    }
  });

  await prisma.drinkRoom.deleteMany({
    where: { roomDate: today }
  });

  res.json({ message: 'Today room reset' });
});

export default router;
