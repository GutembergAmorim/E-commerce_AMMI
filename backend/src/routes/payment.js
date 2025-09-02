import express from "express";
import {
  createPreference,
  handleWebhook,
  getPaymentStatus,
  verifyWebhookSignature,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Rota para criar a preferência de pagamento do Mercado Pago
// POST /api/payment/create-preference
router.post("/create-preference", protect, createPreference);
// Rota para receber notificações do Mercado Pago (webhook)
router.post("/webhook", verifyWebhookSignature, handleWebhook);
// Rota para consultar o status do pagamento
router.get("/status/:orderId", protect, getPaymentStatus);

export default router;
