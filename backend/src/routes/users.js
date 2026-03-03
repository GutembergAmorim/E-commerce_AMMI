import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  listUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  updateProfile,
} from '../controllers/userController.js';

const router = express.Router();

// Rota do perfil do próprio usuário (não requer admin)
router.put('/profile', protect, updateProfile);

// Rotas admin
router.use(protect, admin);

router.get('/', listUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;
