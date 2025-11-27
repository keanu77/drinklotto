import express from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stores/random?region=大安區
router.get('/random', async (req, res) => {
  const region = req.query.region || '大安區';

  const stores = await prisma.store.findMany({
    where: { isActive: true, region }
  });

  if (stores.length === 0) return res.status(404).json({ error: 'No stores found' });

  const randomStore = stores[Math.floor(Math.random() * stores.length)];
  res.json(randomStore);
});

// 後台：GET /api/stores
router.get('/', authMiddleware, async (req, res) => {
  const stores = await prisma.store.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(stores);
});

// 後台：POST /api/stores
router.post('/', authMiddleware, async (req, res) => {
  const { name, type, region, address, menuUrl, uberUrl, pandaUrl, isActive } = req.body;
  const store = await prisma.store.create({
    data: { name, type, region, address, menuUrl, uberUrl, pandaUrl, isActive: isActive ?? true }
  });
  res.status(201).json(store);
});

// 後台：PUT /api/stores/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const store = await prisma.store.update({ where: { id }, data });
  res.json(store);
});

// 後台：DELETE /api/stores/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.store.delete({ where: { id } });
  res.status(204).end();
});

export default router;
