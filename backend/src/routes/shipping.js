import express from 'express';
import { calculateShippingController } from '../controllers/shippingController.js';

const router = express.Router();

// POST /api/shipping/calculate — público (sem autenticação)
router.post('/calculate', calculateShippingController);

export default router;
