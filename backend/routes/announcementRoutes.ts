import express from 'express';
import { getAnnouncements, createAnnouncement } from '../controllers/announcementController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getAnnouncements);
router.post('/', authenticateToken, createAnnouncement);

export default router;
