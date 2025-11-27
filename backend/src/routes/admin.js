import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
    expiresIn: '1d'
  });

  res.json({ token });
});

// GET /api/admin/me
router.get('/me', authMiddleware, async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    select: { id: true, username: true, createdAt: true }
  });
  res.json(admin);
});

export default router;
