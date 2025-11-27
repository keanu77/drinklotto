import express from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 前台：POST /api/orders
router.post('/', async (req, res) => {
  const { roomId, storeId, name, drink, sweetness, iceLevel, toppings, notes } = req.body;

  const order = await prisma.order.create({
    data: {
      roomId,
      storeId,
      name,
      drink,
      sweetness,
      iceLevel,
      toppings: toppings ? JSON.stringify(toppings) : null,
      notes: notes || '',
      status: 'pending'
    }
  });

  res.status(201).json(order);
});

// 後台：GET /api/orders/today (或指定日期 ?date=2025-01-15)
router.get('/today', authMiddleware, async (req, res) => {
  let targetDate;

  if (req.query.date) {
    // 使用指定日期
    targetDate = new Date(req.query.date);
  } else {
    // 使用今天
    targetDate = new Date();
  }

  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay
      }
    },
    include: {
      store: true,
      room: true
    },
    orderBy: { createdAt: 'asc' }
  });

  res.json(orders);
});

// 後台：GET /api/orders/dates - 取得有訂單的日期列表
router.get('/dates', authMiddleware, async (req, res) => {
  const orders = await prisma.order.findMany({
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' }
  });

  // 取得不重複的日期列表
  const dateSet = new Set();
  orders.forEach(o => {
    const dateStr = o.createdAt.toISOString().split('T')[0];
    dateSet.add(dateStr);
  });

  res.json(Array.from(dateSet));
});

export default router;
