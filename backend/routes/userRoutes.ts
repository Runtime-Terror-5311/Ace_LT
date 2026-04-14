import express from 'express';
<<<<<<< HEAD
import { getUsers, registerUser, deleteUser, togglePaymentStatus, updateUserProfile } from '../controllers/userController';
=======
import { getUsers, registerUser, deleteUser, togglePaymentStatus, updateProfile } from '../controllers/userController';
>>>>>>> 75a78a7 (Fixed image uploading and removed unwanted files)
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET is public (for displaying team leadership), others require authentication
router.get('/', getUsers);
router.post('/register', authenticateToken, registerUser);
router.delete('/:id', authenticateToken, deleteUser);
router.patch('/:id/payment', authenticateToken, togglePaymentStatus);
<<<<<<< HEAD
router.patch('/profile', authenticateToken, updateUserProfile);
=======
router.put('/update-profile', authenticateToken, updateProfile);
>>>>>>> 75a78a7 (Fixed image uploading and removed unwanted files)

export default router;
