import express from 'express';
import { getUsers, registerUser, deleteUser, togglePaymentStatus, updateUserProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getUsers);
router.post('/register', authenticateToken, registerUser);
router.delete('/:id', authenticateToken, deleteUser);
router.patch('/:id/payment', authenticateToken, togglePaymentStatus);
router.patch('/profile', authenticateToken, updateUserProfile);

export default router;
