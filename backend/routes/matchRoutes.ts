import express from 'express';
import { getMatches, createMatch } from '../controllers/matchController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getMatches);
router.post('/', authenticateToken, createMatch);

export default router;
