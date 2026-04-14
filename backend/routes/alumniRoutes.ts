import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getAlumni, createAlumni, updateAlumni, deleteAlumni } from '../controllers/alumniController';

const router = express.Router();

// GET is public, others require authentication
router.get('/', getAlumni);
router.post('/', authenticateToken, createAlumni);
router.put('/:id', authenticateToken, updateAlumni);
router.delete('/:id', authenticateToken, deleteAlumni);

export default router;
