import express from 'express';
import { getRequests, createRequest, updateRequest } from '../controllers/requestController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getRequests);
router.post('/', authenticateToken, createRequest);
router.put('/:id', authenticateToken, updateRequest);

export default router;
