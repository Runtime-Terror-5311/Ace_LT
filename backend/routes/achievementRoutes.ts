import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getAchievements, createAchievement, deleteAchievement } from '../controllers/achievementController';

const router = express.Router();

// GET is public, POST and DELETE require authentication
router.get('/', getAchievements);
router.post('/', authenticateToken, createAchievement);
router.delete('/:id', authenticateToken, deleteAchievement);

export default router;