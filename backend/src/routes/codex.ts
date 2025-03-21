import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all codex entries
router.get('/', async (req, res) => {
  try {
    const entries = await prisma.codex.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching codex entries:', error);
    res.status(500).json({ error: 'Failed to fetch codex entries' });
  }
});

// Add new codex entry
router.post('/', async (req, res) => {
  try {
    const { cycle, content } = req.body;
    const entry = await prisma.codex.create({
      data: {
        cycle,
        content
      }
    });
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating codex entry:', error);
    res.status(500).json({ error: 'Failed to create codex entry' });
  }
});

export default router; 