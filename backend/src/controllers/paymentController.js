import axios from "axios";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

dotenv.config();

// ── InfinitePay configuration ───────────────────────────────────────────
const INFINITEPAY_API = process.env.INFINITEPAY_API_URL || "https://api.infinitepay.io";
const INFINITEPAY_HANDLE = process.env.INFINITEPAY_HANDLE;

if (!INFINITEPAY_HANDLE) {
  console.error("❌ INFINITEPAY_HANDLE não está definido nas variáveis de ambiente!");
}

console.log("💰 InfinitePay configurado:", {
  handle: INFINITEPAY_HANDLE,
  apiUrl: INFINITEPAY_API,
});

// ── Helpers ────────────────────────────────────────────────────────────

function validateClientURL() {
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    throw new Error("CLIENT_URL não está definido nas variáveis de ambiente.");
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
      throw new Error(`Produto ${item.name} não encontrado.`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Estoque insuficiente para o produto ${item.name}. Estoque atual: ${product.stock}`
      );
    }
  }
}

// Map InfinitePay capture_method to display label
const mapCaptureMethod = (method) => {
  const map = {
    credit_card: "Cartão de Crédito",
    pix: "PIX",
    debit_card: "Cartão de Débito",
  };
  return map[method] || method || "Não definido";
};

// ── Create Checkout (redirect to InfinitePay) ─────────────────────────
const createCheckout = async (req, res) => {
  try {
    const { cartItems, shippingAddress, shippingPrice } = req.body;

    if (!cartItems || !cartItems.length) {
      return res.status(400).json({ success: false, message: "Carrinho vazio" });
    }

    const user = validateUser(req.user);
    await validateStock(cartItems);
    const clientUrl = validateClientURL();

    // Calculate prices
    const itemsPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const finalShippingPrice = Number(shippingPrice) || 0;
    const total = itemsPrice + finalShippingPrice;

    // Create order in MongoDB
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
      paymentMethod: "INFINITEPAY",
      itemsPrice,
      taxPrice: 0,
      shippingPrice: finalShippingPrice,
      total,
      status: "Pendente",
      isPaid: false,
    });

    console.log("✅ Pedido criado:", order._id);

    // Build InfinitePay checkout payload
    const items = cartItems.map((item) => ({
      description: item.name,
      quantity: Number(item.quantity) || 1,
      price: Math.round(item.price * 100), // InfinitePay uses cents
    }));

    // Add shipping as an item if there's a shipping cost
    if (finalShippingPrice > 0) {
      items.push({
        description: "Frete",
        quantity: 1,
        price: Math.round(finalShippingPrice * 100),
      });
    }

    const body = {
      handle: INFINITEPAY_HANDLE,
      order_nsu: order._id.toString(),
      redirect_url: `${clientUrl}/order-confirmation/${order._id}`,
      webhook_url: `${clientUrl}/api/payment/webhook`,
      items,
      customer: {
        name: user.name || "Cliente",
        email: user.email,
      },
      address: {
        cep: (shippingAddress?.cep || "").replace(/\D/g, ""),
        number: shippingAddress?.numero || "S/N",
        complement: shippingAddress?.complemento || "",
      },
    };

    console.log("📤 Enviando para InfinitePay:", JSON.stringify(body, null, 2));

    // Call InfinitePay API
    const response = await axios.post(
      `${INFINITEPAY_API}/invoices/public/checkout/links`,
      body,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    const checkoutData = response.data;
    console.log("✅ InfinitePay respondeu:", JSON.stringify(checkoutData, null, 2));

    if (!checkoutData || !checkoutData.url) {
      throw new Error("InfinitePay não retornou a URL de checkout");
    }

    // Save the checkout URL reference
    order.infinitePayCheckoutUrl = checkoutData.url;
    await order.save();

    return res.status(201).json({
      success: true,
      orderId: order._id,
      checkoutUrl: checkoutData.url,
      total: order.total,
    });
  } catch (error) {
    console.error("❌ Erro InfinitePay:", error.response?.data || error.message);

    let message = "Erro ao criar checkout de pagamento";
    let status = 500;

    if (error.response?.data) {
      message = error.response.data.message || error.response.data.error || message;
      status = error.response.status || 400;
    } else if (error.message) {
      message = error.message;
    }

    return res.status(status).json({ success: false, message });
  }
};

// ── Webhook handler (InfinitePay sends payment confirmation) ──────────
const handleWebhook = async (req, res) => {
  try {
    const payload = req.body || {};

    console.log("🔔 Webhook InfinitePay recebido:", JSON.stringify(payload, null, 2));

    const orderNsu = payload.order_nsu;
    const transactionNsu = payload.transaction_nsu;
    const captureMethod = payload.capture_method;
    const amount = payload.amount;
    const paidAmount = payload.paid_amount;
    const installments = payload.installments;

    if (!orderNsu) {
      console.log("⚠️ Webhook sem order_nsu, ignorando");
      return res.status(200).json({ success: true, message: null });
    }

    // Find the order
    const order = await Order.findById(orderNsu);
    if (!order) {
      console.log("❌ Pedido não encontrado:", orderNsu);
      return res.status(400).json({ success: false, message: "Pedido não encontrado" });
    }

    // Update order with payment data
    order.status = "Pago";
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentMethod = mapCaptureMethod(captureMethod);
    order.infinitePayTransactionNsu = transactionNsu;

    if (installments) {
      order.installments = installments;
    }

    // Update stock
    if (!order.stockUpdated) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
      order.stockUpdated = true;
      console.log("📦 Estoque atualizado para o pedido:", orderNsu);
    }

    await order.save();
    console.log("✅ Pedido atualizado via webhook:", orderNsu, "→ Pago");

    return res.status(200).json({ success: true, message: null });
  } catch (error) {
    console.error("❌ Erro no webhook InfinitePay:", error);
    // Respond 200 to prevent retries on internal errors
    return res.status(200).json({ success: true, message: null });
  }
};

// ── Verify Payment (manual check) ────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { orderId, transactionNsu, slug } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId é obrigatório" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Pedido não encontrado" });
    }

    // If already paid, return immediately
    if (order.isPaid) {
      return res.json({
        success: true,
        paid: true,
        status: order.status,
        orderId: order._id,
        paymentMethod: order.paymentMethod,
      });
    }

    // Verify with InfinitePay
    try {
      const response = await axios.post(
        `${INFINITEPAY_API}/invoices/public/checkout/payment_check`,
        {
          handle: INFINITEPAY_HANDLE,
          order_nsu: orderId,
          transaction_nsu: transactionNsu || order.infinitePayTransactionNsu || "",
          slug: slug || "",
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      const checkResult = response.data;
      console.log("🔍 Verificação InfinitePay:", JSON.stringify(checkResult, null, 2));

      if (checkResult.paid) {
        order.status = "Pago";
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentMethod = mapCaptureMethod(checkResult.capture_method);

        if (checkResult.installments) {
          order.installments = checkResult.installments;
        }

        // Update stock
        if (!order.stockUpdated) {
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity },
            });
          }
          order.stockUpdated = true;
        }

        await order.save();
      }

      return res.json({
        success: true,
        paid: checkResult.paid || false,
        amount: checkResult.amount,
        paidAmount: checkResult.paid_amount,
        installments: checkResult.installments,
        captureMethod: checkResult.capture_method,
        status: order.status,
        orderId: order._id,
      });
    } catch (apiError) {
      console.log("⚠️ Verificação InfinitePay falhou:", apiError.response?.data || apiError.message);
      return res.json({
        success: true,
        paid: false,
        status: order.status,
        orderId: order._id,
        message: "Pagamento ainda não confirmado",
      });
    }
  } catch (error) {
    console.error("❌ Erro na verificação de pagamento:", error);
    return res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
};

// ── Get Payment Status ───────────────────────────────────────────────
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Acesso não autorizado" });
    }

    return res.json({
      status: order.status,
      total: order.total,
      orderId: order._id,
      isPaid: order.isPaid,
      paymentMethod: order.paymentMethod,
    });
  } catch (error) {
    console.error("Erro ao obter status do pagamento:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export { createCheckout, handleWebhook, verifyPayment, getPaymentStatus };
