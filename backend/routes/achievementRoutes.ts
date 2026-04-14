import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getAchievements, createAchievement, updateAchievement, deleteAchievement } from '../controllers/achievementController';

const router = express.Router();

// GET is public, POST, PUT and DELETE require authentication
router.get('/', getAchievements);
router.post('/', authenticateToken, createAchievement);
router.put('/:id', authenticateToken, updateAchievement);
router.delete('/:id', authenticateToken, deleteAchievement);

export default router;