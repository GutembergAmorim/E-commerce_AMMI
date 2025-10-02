import express from "express";
import { createPix, createCreditCardPayment, handleWebhook, getPaymentStatus } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Criar cobrança PIX no PagSeguro
router.post("/create-pix", protect, createPix);
// Criar pagamento com cartao no PagSeguro
router.post("/create-credit-card", protect, createCreditCardPayment);
// Webhook do PagSeguro
router.post("/webhook", handleWebhook);
// Rota para consultar o status do pagamento
router.get("/status/:orderId", protect, getPaymentStatus);

export default router;
