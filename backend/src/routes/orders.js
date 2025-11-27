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

// 後台：GET /api/orders/today
router.get('/today', authMiddleware, async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
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

export default router;
