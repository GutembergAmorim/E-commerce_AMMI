import axios from "axios";
import dotenv from "dotenv";
import { URL } from "url";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import crypto from "crypto";

dotenv.config();

function validateClientURL() {
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    throw new Error("CLIENT_URL não está definido nas variáveis de ambiente.");
  }
  const url = new URL(clientUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("CLIENT_URL deve começar com http:// ou https://");
  }
  return clientUrl;
}

function validateUser(user) {
  if (!user || !user.id) {
    throw new Error("Usuário inválido ou não autenticado.");
  }
  if (!user.email) {
    throw new Error("Email do usuário é obrigatório.");
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name || "",
  };
}

async function validateStock(cartItems) {
  for (const item of cartItems) {
    const product = await Product.findById(item.id);
    if (!product) {
      throw new Error(`Produto ${item.name} nao encontrado.`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Estoque insuficiente para o produto ${item.name}. Estoque atual: ${product.stock}`
      );
    }
  }
}

const pagseguroApi = axios.create({
  baseURL: process.env.PAGSEGURO_BASE_URL || "https://sandbox.api.pagseguro.com",
  headers: {
    Authorization: `Bearer ${process.env.PAGSEGURO_TOKEN || ""}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const mapPgStatus = (pgStatus) => {
  const status = String(pgStatus || "").toUpperCase();
  const map = {
    PAID: "Pago",
    AUTHORIZED: "Pago",
    WAITING: "Pendente",
    IN_ANALYSIS: "Processando",
    DECLINED: "Cancelado",
    CANCELED: "Cancelado",
    REFUNDED: "Reembolsado",
    CHARGED_BACK: "Chargeback",
  };
  return map[status] || "Processando";
};

const createPix = async (req, res) => {
  const { cartItems, shippingAddress } = req.body;
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "O carrinho está vazio ou é inválido." });
  }

  try {
    const user = validateUser(req.user);
    await validateStock(cartItems);
    validateClientURL();

    const itemsPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxPrice = 0;
    const shippingPrice = 0;
    const total = itemsPrice + taxPrice + shippingPrice;

    const order = await Order.create({
      user: user.id,
      orderItems: cartItems.map((item) => ({
        product: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        image: item.image,
      })),
      shippingAddress: {
        address: shippingAddress?.logradouro || shippingAddress?.address,
        number: shippingAddress?.numero,
        complement: shippingAddress?.complemento || shippingAddress?.complement,
        neighborhood: shippingAddress?.bairro || shippingAddress?.neighborhood,
        city: shippingAddress?.localidade || shippingAddress?.city,
        state: shippingAddress?.uf || shippingAddress?.state,
        postalCode: shippingAddress?.cep || shippingAddress?.postalCode,
        country: "Brasil",
      },
      paymentMethod: "PagSeguro",
      itemsPrice,
      taxPrice,
      shippingPrice,
      total,
      status: "Pendente",
      isPaid: false,
    });

    const idempotencyKey = crypto.randomUUID();
    const amountInCents = Math.round(total * 100);

    const body = {
      reference_id: String(order._id),
      description: `Pedido ${order._id}`,
      amount: { value: amountInCents, currency: "BRL" },
      payment_method: { type: "PIX" },
      notification_urls: [ `${process.env.BACKEND_URL}/api/payment/webhook` ],
    };

    const { data } = await pagseguroApi.post("/charges", body, {
      headers: { "x-idempotency-key": idempotencyKey },
    });

    const chargeId = data?.id;
    const qr = Array.isArray(data?.qr_codes) ? data.qr_codes[0] : undefined;

    order.pgChargeId = chargeId || null;
    await order.save();

    return res.status(201).json({
      orderId: order._id,
      chargeId: chargeId,
      qrCodeText: qr?.text || null,
      qrCodeLink: qr?.links?.[0]?.href || qr?.link || null,
      expiresAt: qr?.expiration_date || null,
    });
  } catch (error) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data || error?.message || "Erro ao criar cobrança PIX";
    console.error("Erro PagSeguro /charges:", message);
    return res.status(status).json({ success: false, message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    const chargeId = payload?.id || payload?.data?.id || payload?.charge_id;

    if (!chargeId) {
      console.log("Webhook recebido sem chargeId identificável", payload);
      return res.status(200).send("ignored");
    }

    // Buscar status atual da cobrança para evitar confiar no payload
    let charge;
    try {
      const { data } = await pagseguroApi.get(`/charges/${chargeId}`);
      charge = data;
    } catch (err) {
      console.log("Falha ao consultar charge no PagSeguro:", err?.response?.data || err.message);
      return res.status(200).send("no-charge");
    }

    const referenceId = charge?.reference_id;
    const status = mapPgStatus(charge?.status);

    if (referenceId) {
      const order = await Order.findById(referenceId);
      if (order) {
        order.status = status;
        if (status === "Pago") {
          order.isPaid = true;
          order.paidAt = new Date();
          if (!order.stockUpdated) {
            for (const item of order.orderItems) {
              await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
            }
            order.stockUpdated = true;
          }
        }
        await order.save();
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Erro no webhook PagSeguro:", error);
    return res.status(200).send("OK");
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Acesso não autorizado" });
    }

    if (order.pgChargeId) {
      try {
        const { data } = await pagseguroApi.get(`/charges/${order.pgChargeId}`);
        const status = mapPgStatus(data?.status);
        order.status = status;
        if (status === "Pago") {
          order.isPaid = true;
          order.paidAt = new Date();
          if (!order.stockUpdated) {
            for (const item of order.orderItems) {
              await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
            }
            order.stockUpdated = true;
          }
        }
        await order.save();
      } catch (err) {
        console.log("Falha ao consultar charge status:", err?.response?.data || err.message);
      }
    }

    return res.json({ status: order.status, total: order.total, orderId: order._id });
  } catch (error) {
    console.error("Erro ao obter status do pagamento:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export { createPix, handleWebhook, getPaymentStatus };
