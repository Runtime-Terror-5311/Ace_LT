import express from 'express';
import { getInventory, updateInventory } from '../controllers/inventoryController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getInventory);
router.put('/:id', authenticateToken, updateInventory);

export default router;
