// src/routes/stockRoutes.js
import express from 'express';
import { 
  adjustStock, 
  getLowStock, 
  getStockHistory, 
  getStockReport 
} from '../controllers/stockController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/low-stock', protect, admin, getLowStock);
router.get('/report', protect, admin, getStockReport);
router.get('/history/:productId', protect, admin, getStockHistory);
router.post('/adjust/:productId', protect, admin, adjustStock);

export default router;