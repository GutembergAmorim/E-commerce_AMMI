import express from "express";
import { createCheckout, handleWebhook, verifyPayment, getPaymentStatus } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Criar checkout InfinitePay (gera link de pagamento)
router.post("/create-checkout", protect, createCheckout);

// Verificar pagamento manualmente
router.post("/verify", protect, verifyPayment);

// Webhook da InfinitePay (recebe confirmação de pagamento)
router.post("/webhook", handleWebhook);

// Consultar status do pagamento
router.get("/status/:orderId", protect, getPaymentStatus);

export default router;
