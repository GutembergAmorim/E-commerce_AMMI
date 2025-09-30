import axios from "axios";
import dotenv from "dotenv";
import { URL } from "url";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import crypto from "crypto";

dotenv.config();

console.log("🔐 VERIFICAÇÃO DO TOKEN:", {
  tokenExists: !!process.env.PAGSEGURO_TOKEN,
  tokenLength: process.env.PAGSEGURO_TOKEN?.length,
  tokenStartsWith: process.env.PAGSEGURO_TOKEN?.substring(0, 10),
  tokenEndsWith: process.env.PAGSEGURO_TOKEN?.substring(process.env.PAGSEGURO_TOKEN?.length - 10)
});

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
    "Authorization": `Bearer ${process.env.PAGSEGURO_TOKEN}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
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

async function testAuth() {
  try {
    const testResponse = await pagseguroApi.get("/charges");
    console.log("✅ Autenticação OK - Status:", testResponse.status);
    return true;
  } catch (error) {
    console.error("❌ Falha na autenticação:", error.response?.status);
    return false;
  }
}

const createPix = async (req, res) => {
  try {
    const { cartItems, shippingAddress } = req.body;

    if (!cartItems || !cartItems.length) {
      return res.status(400).json({ success: false, message: "Carrinho vazio" });
    }

    // Valida usuário
    if (!req.user || !req.user.id || !req.user.email) {
      return res.status(401).json({ success: false, message: "Usuário não autenticado" });
    }
    const user = req.user;

    // Valida estoque
    for (const item of cartItems) {
      const product = await Product.findById(item.id);
      if (!product) throw new Error(`Produto ${item.name} não encontrado`);
      if (product.stock < item.quantity) throw new Error(`Estoque insuficiente para ${item.name}`);
    }

    // Calcula valores
    const itemsPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingPrice = 0;
    const taxPrice = 0;
    const total = itemsPrice + shippingPrice + taxPrice;
    const totalCents = Math.round(total * 100);

    // Cria pedido
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
        address: shippingAddress.logradouro,
        number: shippingAddress.numero,
        complement: shippingAddress.complemento || "",
        neighborhood: shippingAddress.bairro,
        city: shippingAddress.localidade,
        state: shippingAddress.uf,
        postalCode: shippingAddress.cep,
        country: "Brasil",
      },
      paymentMethod: "PIX",
      itemsPrice,
      taxPrice,
      shippingPrice,
      total,
      status: "Pendente",
      isPaid: false,
    });

    const idempotencyKey = crypto.randomUUID();

    // Body PIX para PagSeguro
    const body = {
      reference_id: order._id.toString(),
      description: `Pedido #${order._id}`,
      amount: {
        value: totalCents,
        currency: "BRL",
      },
      customer: {
        name: user.name,
        email: user.email,
        tax_id: "12345678909", // ou o CPF real do cliente
      },
      payment_method: {
        type: "PIX",
      },
      notification_urls: [`${process.env.CLIENT_URL}/api/payment/webhook`],
    };

    console.log("📤 Enviando body para PagSeguro:", JSON.stringify(body, null, 2));

    // Envia requisição
    const response = await pagseguroApi.post("/orders", body, {
      headers: { "x-idempotency-key": idempotencyKey },
    });

    const charge = response.data;
    if (!charge || !charge.id) throw new Error("Resposta inválida do PagSeguro");

    order.pgChargeId = charge.id;
    await order.save();

    // Extrai QR Code PIX
    const qrCode = charge.pix || charge.qr_codes?.[0] || charge.text;

    return res.status(201).json({
      success: true,
      orderId: order._id,
      chargeId: charge.id,
      qrCodeText: qrCode?.text || qrCode?.qrcode,
      qrCodeLink: qrCode?.links?.[0]?.href || qrCode?.href,
      expiresAt: qrCode?.expiration_date || new Date(Date.now() + 3600000).toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro PagSeguro:", error.response?.data || error.message);

    let message = "Erro ao processar pagamento";
    let status = 500;

    if (error.response?.data?.error_messages) {
      message = error.response.data.error_messages.map((e) => e.description).join(", ");
      status = error.response.status || 400;
    } else if (error.message) {
      message = error.message;
    }

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
