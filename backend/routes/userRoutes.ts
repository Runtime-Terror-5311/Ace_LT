import express from 'express';
import { getUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getUsers);

export default router;
