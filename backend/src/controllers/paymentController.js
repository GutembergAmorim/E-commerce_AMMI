import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import dotenv from "dotenv";
import { URL } from "url";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import crypto from "crypto";

dotenv.config();

// Função para validar a variável de ambiente CLIENT_URL
function validateClientURL() {
  // Pega a URL do cliente (frontend) das variáveis de ambiente
  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    throw new Error("CLIENT_URL não está definido nas variáveis de ambiente.");
  }
  try {
    const url = new URL(clientUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("CLIENT_URL deve começar com http:// ou https://");
    }
  } catch (err) {
    throw new Error(`CLIENT_URL inválido: ${clientUrl}`, err);
  }
  return clientUrl;
}

//Validador de dados do usuario
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
    surname: user.surname || "",
  };
}

//validador de estoque
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

// Inicializa o cliente do Mercado Pago. É uma boa prática fazer isso uma vez.
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});
const preference = new Preference(client);
const paymentClient = new Payment(client);

/**
 * @desc    Cria uma preferência de pagamento no Mercado Pago
 * @route   POST /api/payment/create-preference
 * @access  Private
 */

const createPreference = async (req, res) => {
  const { cartItems, shippingAddress } = req.body;

  // Validação de entrada
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "O carrinho está vazio ou é inválido.",
    });
  }

  try {
    // Valida o usuário autenticado
    const user = validateUser(req.user);

    // Valida o estoque dos itens no carrinho
    await validateStock(cartItems);

    // Pega a URL do cliente (frontend) validada
    const clientUrl = validateClientURL();

    // Calcular total
    const itemsPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxPrice = itemsPrice * 0.1; // Exemplo: 10% de imposto
    const shippingPrice = 15.0; // Exemplo: frete fixo
    const total = itemsPrice + taxPrice + shippingPrice;

    // Cria a ordem no banco de dados com status 'pending'
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
        address: shippingAddress.logradouro || shippingAddress.address,
        number: shippingAddress.numero,
        complement: shippingAddress.complemento || shippingAddress.complement,
        neighborhood: shippingAddress.bairro || shippingAddress.neighborhood,
        city: shippingAddress.localidade || shippingAddress.city,
        state: shippingAddress.uf || shippingAddress.state,
        postalCode: shippingAddress.cep || shippingAddress.postalCode,
        country: "Brasil",
      },
      paymentMethod: "Mercado Pago", // Agora está no enum
      itemsPrice,
      taxPrice,
      shippingPrice,
      total,
      status: "Pendente", // Usando valor do enum
      isPaid: false,
    });

    // Monta os itens para a preferência do Mercado Pago
    const items = cartItems.map((item) => {
      const unit_price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        isNaN(unit_price) ||
        isNaN(quantity) ||
        unit_price <= 0 ||
        quantity <= 0
      ) {
        // Lançar um erro interromperá o map e será pego pelo catch
        throw new Error(
          `Item inválido no carrinho: '${item.name}' possui valores inválidos.`
        );
      }

      return {
        id: item.id,
        title: item.name,
        description: `Cor: ${item.color || "N/A"}, Tamanho: ${
          item.size || "N/A"
        }`,
        picture_url: item.image,
        currency_id: "BRL",
        unit_price,
        quantity,
      };
    });

    // URLs de retorno ABSOLUTAS e válidas
    const successUrl = `${clientUrl}/payment/success?orderId=${order._id}`;
    const failureUrl = `${clientUrl}/payment/failure?orderId=${order._id}`;
    const pendingUrl = `${clientUrl}/payment/pending?orderId=${order._id}`;

    console.log("URLs de retorno:", {
      success: successUrl,
      failure: failureUrl,
      pending: pendingUrl,
    });

    try {
      new URL(successUrl);
      new URL(failureUrl);
      new URL(pendingUrl);
    } catch (urlError) {
      throw new Error("Uma ou mais URLs de retorno são inválidas.");
    }

    const preferenceBody = {
      items,
      payer: {
        email: user.email,
        first_name: user.name,
        last_name: user.surname,
        identification: {
          type: "CPF", // ou 'CNPJ'
          number: req.body.payer?.cpf || "", // Exemplo: req.body.payer.cpf
        },
        phone: {
          area_code: req.body.payer?.phone?.area_code || "", // Exemplo: req.body.payer.phone.area_code
          number: req.body.payer?.phone?.number || "", // Exemplo: req.body.payer.phone.number
        },
        address: {
          zip_code: shippingAddress.postalCode,
          street_name: shippingAddress.address,
          street_number: shippingAddress.number,
        },
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      auto_return: "approved",
      notification_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
      external_reference: order._id.toString(),
    };

    const result = await preference.create({ body: preferenceBody });

    //Atualiza o pedido com o ID da preferência
    order.mpPreferenceId = result.id;
    await order.save();

    res.status(201).json({
      id: result.id,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Erro ao criar preferência do Mercado Pago:", error);

    // O erro do SDK do Mercado Pago vem com 'status' e 'message'.
    // Erros que nós lançamos (como 'Item inválido') têm 'message'.
    const errorMessage =
      error.message ||
      error.cause?.message ||
      "Falha ao criar a preferência de pagamento.";
    const errorStatus = error.status || error.statusCode || 500;

    res.status(errorStatus).json({
      success: false,
      message: errorMessage,
      details: error.response?.data || null,
    });
  }
};

/**
 * @desc    Webhook para receber notificações do Mercado Pago
 * @route   POST /api/payment/webhook
 * @access  Public (Mercado Pago chama esta URL)
 */
const handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    const signature = req.headers["x-signature"];

    console.log("📨 Webhook recebido:", { type, data });

    // Log da assinatura para debugging
    if (signature) {
      console.log("🔐 Assinatura recebida:", signature);
    }

    // Verificar se é um teste (sem assinatura em desenvolvimento)
    const isTest = !signature && data.id && data.id.startsWith("test_");
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment && isTest) {
      console.log("🧪 Modo desenvolvimento - processando webhook simulado");
    }

    if (type === "payment") {
      let paymentInfo;

      if (isDevelopment && isTest) {
        // Processamento para testes em desenvolvimento
        paymentInfo = await processTestPayment(data);
      } else {
        // Processamento para produção - buscar do Mercado Pago
        try {
          paymentInfo = await paymentClient.get({ id: data.id });
          console.log("💳 Informações reais do MP:", paymentInfo.status);
        } catch (mpError) {
          console.error("❌ Erro ao buscar pagamento no MP:", mpError.message);
          return res
            .status(400)
            .json({ error: "Pagamento não encontrado no Mercado Pago" });
        }
      }

      const { status, external_reference } = paymentInfo;

      console.log("💳 Informações do pagamento:", {
        status,
        external_reference,
        paymentId: data.id,
      });

      // Processar o pedido
      await processOrderPayment(external_reference, status, data.id);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(500).json({
      error: "Erro interno no servidor",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Função auxiliar para processar testes
const processTestPayment = async (data) => {
  const statusMap = {
    test_approved: "approved",
    test_approved_: "approved",
    test_pending: "pending",
    test_pending_: "pending",
    test_rejected: "rejected",
    test_rejected_: "rejected",
  };

  let status = "pending";
  let paymentId = data.id;

  // Determinar status baseado no ID de teste
  for (const [prefix, statusValue] of Object.entries(statusMap)) {
    if (data.id.startsWith(prefix)) {
      status = statusValue;
      break;
    }
  }

  return {
    status,
    external_reference: data.external_reference || data.id,
  };
};

// Função auxiliar para processar pedidos
const processOrderPayment = async (orderId, status, paymentId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error(`Pedido não encontrado: ${orderId}`);
  }

  // Mapear status do Mercado Pago para seu sistema
  const statusMap = {
    approved: "Pago",
    pending: "Pendente",
    in_process: "Processando",
    rejected: "Cancelado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    charged_back: "Chargeback",
  };

  order.status = statusMap[status] || "Processando";
  order.mpPaymentId = paymentId;

  if (status === "approved") {
    order.isPaid = true;
    order.paidAt = new Date();

    // Atualizar estoque apenas se ainda não foi atualizado
    if (!order.stockUpdated) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
      order.stockUpdated = true;
      console.log("📦 Estoque atualizado para o pedido:", orderId);
    }
  }

  await order.save();
  console.log("✅ Pedido atualizado:", order._id, "Status:", order.status);
};

const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers["x-signature"];
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  // Em desenvolvimento, permitir sem assinatura para testes
  if (process.env.NODE_ENV === "development") {
    if (!webhookSecret) {
      console.log(
        "⚠️  Desenvolvimento: MERCADOPAGO_WEBHOOK_SECRET não configurado"
      );
    }

    // Permitir webhooks de teste (começam com "test_")
    if (
      !signature &&
      req.body.data &&
      req.body.data.id &&
      req.body.data.id.startsWith("test_")
    ) {
      console.log(
        "🧪 Desenvolvimento: Webhook de teste permitido sem assinatura"
      );
      return next();
    }

    if (!signature) {
      console.log("❌ Desenvolvimento: Webhook sem assinatura e não é teste");
      return res.status(401).json({ error: "Assinatura necessária" });
    }
  }

  // Em produção, exigir assinatura
  if (!webhookSecret) {
    console.log("❌ MERCADOPAGO_WEBHOOK_SECRET não configurado");
    return res
      .status(500)
      .json({ error: "Configuração incompleta do servidor" });
  }

  if (!signature) {
    console.log("❌ Assinatura do webhook não fornecida");
    return res.status(401).json({ error: "Assinatura inválida" });
  }

  try {
    // Verificar assinatura - formato: "version=1,ts=123456789,sig=abc123"
    const signatureParts = signature.split(",");
    const signatureObj = {};

    signatureParts.forEach((part) => {
      const [key, value] = part.split("=");
      signatureObj[key] = value;
    });

    const timestamp = signatureObj.ts;
    const receivedSignature = signatureObj.sig;

    if (!timestamp || !receivedSignature) {
      console.log("❌ Formato de assinatura inválido");
      return res.status(401).json({ error: "Formato de assinatura inválido" });
    }

    const payload = `${timestamp}.${JSON.stringify(req.body)}`;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    if (receivedSignature !== expectedSignature) {
      console.log("❌ Assinatura do webhook inválida");
      console.log("Recebido:", receivedSignature);
      console.log("Esperado:", expectedSignature);
      console.log("Payload:", payload);
      return res.status(401).json({ error: "Assinatura inválida" });
    }

    console.log("✅ Assinatura do webhook validada");
    next();
  } catch (error) {
    console.error("❌ Erro ao verificar assinatura:", error);
    res.status(500).json({ error: "Erro na verificação de assinatura" });
  }
};

/**
 * @desc    Obtém status de um pagamento
 * @route   GET /api/payment/status/:orderId
 * @access  Private
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Verificar se o usuário tem permissão para ver este pedido
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Acesso não autorizado" });
    }

    res.json({
      status: order.status,
      paymentId: order.mpPaymentId,
      total: order.total,
    });
  } catch (error) {
    console.error("Erro ao obter status do pagamento:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export {
  createPreference,
  handleWebhook,
  verifyWebhookSignature,
  getPaymentStatus,
};
