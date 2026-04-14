import express from 'express';
import { getMatches, createMatch, deleteAllMatches } from '../controllers/matchController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getMatches);
router.post('/', authenticateToken, createMatch);
router.post('/reset', authenticateToken, deleteAllMatches);

export default router;
