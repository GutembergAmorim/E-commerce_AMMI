import express from 'express';
import { 
    getOrderById, 
    getUserOrders, 
    getAllOrders, 
    updateOrderStatus 
  } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Rotas específicas primeiro
router.put('/:id/status', protect, admin, updateOrderStatus);
router.get('/:id', protect, getOrderById);

// Rotas gerais por último
router.get('/', protect, getUserOrders);
router.get('/admin/all', protect, admin, getAllOrders);

// ✅ Exporte como default
export default router;