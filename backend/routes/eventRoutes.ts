import express from 'express';
import { getEvents, createEvent, deleteEvent } from '../controllers/eventController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getEvents);
router.post('/', authenticateToken, createEvent);
router.delete('/:id', authenticateToken, deleteEvent);

export default router;
