import express from 'express';
import { getAttendance, submitAttendance } from '../controllers/attendanceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getAttendance);
router.post('/', authenticateToken, submitAttendance);

export default router;
