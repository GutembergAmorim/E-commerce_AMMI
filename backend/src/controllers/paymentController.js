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
    "Accept": "*/*"
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
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
    PENDING: "Pendente"
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
    const { cartItems, shippingAddress, shippingPrice } = req.body;

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
    const finalShippingPrice = Number(shippingPrice) || 0;
    const taxPrice = 0;
    const total = itemsPrice + finalShippingPrice + taxPrice;
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
      shippingPrice: finalShippingPrice,
      total,
      status: "Pendente",
      isPaid: false,
    });

    const idempotencyKey = crypto.randomUUID();

    // Body PIX para PagSeguro conforme documentação oficial
    const clientUrl = validateClientURL();
    const body = {
      reference_id: order._id.toString(),
      customer: {
        name: user.name || "Cliente",
        email: user.email,
        tax_id: "12345678909", // CPF fixo para teste sandbox
        phones: [
          {
            country: "55",
            area: "11",
            number: "999999999",
            type: "MOBILE"
          }
        ]
      },
      items: cartItems.map(item => ({
        reference_id: (item.id || "item").toString(),
        name: item.name,
        quantity: Number(item.quantity) || 1,
        unit_amount: Math.round(item.price * 100)
      })),
      qr_codes: [
        {
          amount: {
            value: totalCents
          },
          expiration_date: new Date(Date.now() + 3600000).toISOString(),
        }
      ],
      shipping: {
        address: {
          street: shippingAddress?.logradouro || "Não informado",
          number: shippingAddress?.numero || "S/N",
          complement: shippingAddress?.complemento || "",
          locality: shippingAddress?.bairro || "Centro",
          city: shippingAddress?.localidade || "São Paulo",
          region_code: shippingAddress?.uf || "SP",
          country: "BRA",
          postal_code: (shippingAddress?.cep || "01452002").replace(/\D/g, '')
        }
      },
      notification_urls: [
        `${clientUrl}/api/payment/webhook`
      ],
    };

    console.log("📤 Enviando body para PagSeguro:", JSON.stringify(body, null, 2));

    // Envia requisição
    const response = await pagseguroApi.post("/orders", body, {
      headers: { "x-idempotency-key": idempotencyKey },
    });

    const pgOrder = response.data;
    if (!pgOrder || !pgOrder.id) throw new Error("Resposta inválida do PagSeguro");

    // Salva o ID da Ordem do PagSeguro
    order.pgChargeId = pgOrder.id;
    await order.save();

    // Tenta extrair o QR Code da resposta imediata
    let qrCodeText = null;
    let qrCodeLink = null;
    let expiresAt = new Date(Date.now() + 3600000).toISOString();

    console.log("🚀 DEBUG: createPix - Analisando resposta do PagSeguro");
    if (pgOrder.charges && pgOrder.charges.length > 0) {
      const charge = pgOrder.charges[0];
      console.log("🚀 DEBUG: Charge encontrada:", JSON.stringify(charge, null, 2));
      
      // 1. Verifica links (Padrão PagSeguro V2)
      if (charge.links) {
        const linkQrCode = charge.links.find(l => l.rel === "QRCODE.PNG");
        const linkText = charge.links.find(l => l.rel === "QRCODE.TEXT");
        if (linkQrCode) qrCodeLink = linkQrCode.href;
        if (linkText) qrCodeText = linkText.href;
      }
      
      // 2. Verifica objeto pix dentro de payment_method
      if (charge.payment_method?.pix) {
        if (!qrCodeText) qrCodeText = charge.payment_method.pix.qrcode || charge.payment_method.pix.text;
        if (!qrCodeLink) qrCodeLink = charge.payment_method.pix.image || charge.payment_method.pix.qr_code_image;
        if (charge.payment_method.pix.expiration_date) {
            expiresAt = charge.payment_method.pix.expiration_date;
        }
      }

      // 3. Verifica propriedades diretas na charge (observado em logs)
      if (!qrCodeText) {
        if (charge.text) qrCodeText = charge.text;
        if (charge.qrcode) qrCodeText = charge.qrcode;
        if (charge.qr_code) {
            qrCodeText = typeof charge.qr_code === 'object' ? charge.qr_code.text : charge.qr_code;
        }
      }
    }

    // 4. Se não encontrou na charge, tenta na raiz (fallback)
    if (!qrCodeText && pgOrder.qr_codes && pgOrder.qr_codes.length > 0) {
        qrCodeText = pgOrder.qr_codes[0].text || pgOrder.qr_codes[0].qrcode;
        qrCodeLink = pgOrder.qr_codes[0].links?.[0]?.href;
    }

    // 5. Busca Recursiva (Último recurso)
    if (!qrCodeText) {
        console.log("🚀 DEBUG: createPix - Tentando busca recursiva");
        const searchForPix = (obj, depth = 0) => {
          if (depth > 4) return null;
          if (obj && typeof obj === 'object') {
            // Se achou algo que parece um QR Code texto
            if (obj.text && typeof obj.text === 'string' && obj.text.startsWith('000201')) return { text: obj.text };
            if (obj.qrcode && typeof obj.qrcode === 'string' && obj.qrcode.startsWith('000201')) return { text: obj.qrcode };
            
            for (const key in obj) {
               const res = searchForPix(obj[key], depth + 1);
               if (res) return res;
            }
          }
          return null;
        };
        const found = searchForPix(pgOrder);
        if (found) {
            qrCodeText = found.text;
            console.log("🚀 DEBUG: createPix - QR Code encontrado via busca recursiva");
        }
    }

    console.log("🚀 DEBUG: createPix - Dados extraídos:", { qrCodeText, qrCodeLink, expiresAt });

    // Salva os dados do QR Code no banco para evitar depender da API depois
    order.pixQrCodeText = qrCodeText;
    order.pixQrCodeLink = qrCodeLink;
    order.pixExpiration = expiresAt;
    await order.save();
    console.log("🚀 DEBUG: createPix - Dados salvos no banco");

    return res.status(201).json({
      success: true,
      orderId: order._id,
      chargeId: pgOrder.id,
      qrCodeText: qrCodeText,
      qrCodeLink: qrCodeLink,
      expiresAt: expiresAt,
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

const createCreditCardPayment = async (req, res) => {
  const { cartItems, shippingAddress, encryptedCard, holderName, installments, shippingPrice } = req.body;
  
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "O carrinho está vazio ou é inválido." 
    });
  }

  if (!encryptedCard) {
    return res.status(400).json({
      success: false,
      message: "Dados do cartão criptografados são obrigatórios."
    });
  }

  try {
    const user = validateUser(req.user);
    await validateStock(cartItems);
    const clientUrl = validateClientURL();

    const itemsPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalShippingPrice = Number(shippingPrice) || 0;
    
    let total = itemsPrice + finalShippingPrice;
    
    // Aplica juros progressivos: 5% em 4x, +1% a cada parcela adicional
    if (installments && Number(installments) >= 4) {
      const numInstallments = Number(installments);
      const interestRate = 0.05 + ((numInstallments - 4) * 0.01);
      total = total * (1 + interestRate);
    }

    const orderItems = cartItems.map((item) => ({
      product: item.id || item.product,
      name: item.name,
      price: item.price,
      quantity: Number(item.quantity) || 1,
      color: item.color || '',
      size: item.size || '',
      image: item.image || ''
    }));

    const order = await Order.create({
      user: user.id,
      orderItems: orderItems,
      shippingAddress: {
        address: shippingAddress?.logradouro || '',
        number: shippingAddress?.numero || '',
        complement: shippingAddress?.complemento || '',
        neighborhood: shippingAddress?.bairro || '',
        city: shippingAddress?.localidade || '',
        state: shippingAddress?.uf || '',
        postalCode: shippingAddress?.cep || '',
        country: "Brasil",
      },
      paymentMethod: 'CREDIT_CARD',
      itemsPrice,
      taxPrice: 0,
      shippingPrice: finalShippingPrice,
      total,
      status: "Processando",
      isPaid: false,
      installments: installments || 1
    });

    console.log("✅ Order criada com sucesso:", order._id);

    const idempotencyKey = crypto.randomUUID();
    const amountInCents = Math.round(total * 100);

    // Body conforme documentação oficial PagSeguro: POST /orders com charges[]
    const body = {
      reference_id: order._id.toString(),
      customer: {
        name: user.name || holderName || "Cliente",
        email: user.email,
        tax_id: "12345678909",
        phones: [
          {
            country: "55",
            area: "11",
            number: "999999999",
            type: "MOBILE"
          }
        ]
      },
      items: cartItems.map(item => ({
        reference_id: (item.id || item.product || "item").toString(),
        name: item.name,
        quantity: Number(item.quantity) || 1,
        unit_amount: Math.round(item.price * 100)
      })),
      shipping: {
        address: {
          street: shippingAddress?.logradouro || "Não informado",
          number: shippingAddress?.numero || "S/N",
          complement: shippingAddress?.complemento || "",
          locality: shippingAddress?.bairro || "Centro",
          city: shippingAddress?.localidade || "São Paulo",
          region_code: shippingAddress?.uf || "SP",
          country: "BRA",
          postal_code: (shippingAddress?.cep || "01452002").replace(/\D/g, '')
        }
      },
      notification_urls: [
        `${clientUrl}/api/payment/webhook`
      ],
      charges: [
        {
          reference_id: `charge-${order._id.toString()}`,
          description: `Pedido #${order._id}`,
          amount: {
            value: amountInCents,
            currency: "BRL"
          },
          payment_method: {
            type: "CREDIT_CARD",
            installments: Number(installments) || 1,
            capture: true,
            card: {
              encrypted: encryptedCard,
              store: false
            },
            holder: {
              name: holderName || user.name || "Cliente",
              tax_id: "12345678909"
            }
          }
        }
      ]
    };

    console.log("💳 Enviando para /orders (cartão criptografado)...");
    console.log("📤 Body:", JSON.stringify(body, null, 2));
    
    const response = await pagseguroApi.post("/orders", body, {
      headers: { 
        "x-idempotency-key": idempotencyKey 
      }
    });

    const pgOrder = response.data;
    console.log("✅ Resposta do PagSeguro:", JSON.stringify(pgOrder, null, 2));

    // Extrair dados da charge dentro da resposta da order
    const charge = pgOrder.charges && pgOrder.charges.length > 0 ? pgOrder.charges[0] : null;
    
    // Atualizar ordem com dados do pagamento
    order.pgChargeId = pgOrder.id;
    
    if (charge) {
      order.status = mapPgStatus(charge.status);
      
      if (charge.status === 'PAID' || charge.status === 'AUTHORIZED') {
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = "Pago";
        
        // Atualizar estoque
        if (!order.stockUpdated) {
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, { 
              $inc: { stock: -item.quantity } 
            });
          }
          order.stockUpdated = true;
        }
      }
    }
    
    await order.save();

    res.status(201).json({
      success: true,
      orderId: order._id,
      chargeId: charge?.id || pgOrder.id,
      status: order.status,
      isPaid: order.isPaid,
      paymentResponse: {
        id: charge?.id || pgOrder.id,
        status: charge?.status || pgOrder.status,
        authorization_code: charge?.payment_response?.reference,
        message: charge?.payment_response?.message
      }
    });

  } catch (error) {
    console.error("❌ Erro no pagamento com cartão:", error.response?.data || error.message);
    
    let statusCode = error.response?.status || 500;
    let errorMessage = "Erro ao processar pagamento";

    if (error.response?.data?.error_messages) {
      errorMessage = error.response.data.error_messages.map(msg => 
        `${msg.description} (${msg.code})`
      ).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage
      
    });
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
      const { data } = await pagseguroApi.get(`/orders/${chargeId}`);
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
        if (status === "Pago" || status === "Autorizado") {
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
        const { data } = await pagseguroApi.get(`/orders/${order.pgChargeId}`);
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

const getPixQrCode = async (req, res) => {
  try {
    const { chargeId } = req.params;
    const userId = req.user?.id;

    console.log("🚀 DEBUG: getPixQrCode CALLED");
    console.log("🔍 getPixQrCode - Iniciando busca:", { chargeId, userId });

    if (!chargeId) {
      console.log("❌ getPixQrCode - chargeId não fornecido");
      return res.status(400).json({ error: "ID da cobrança é obrigatório" });
    }

    if (!userId) {
      console.log("❌ getPixQrCode - usuário não autenticado");
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    // Buscar a ordem que possui este chargeId
    console.log("🔍 getPixQrCode - Buscando ordem:", { pgChargeId: chargeId, user: userId });
    const order = await Order.findOne({ pgChargeId: chargeId, user: userId });
    
    console.log("📋 getPixQrCode - Ordem encontrada:", order ? { id: order._id, status: order.status } : null);
    
    if (!order) {
      console.log("❌ getPixQrCode - Ordem não encontrada");
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // VERIFICAÇÃO NO BANCO DE DADOS PRIMEIRO
    if (order.pixQrCodeText) {
        console.log("✅ getPixQrCode - QR Code retornado do banco de dados");
        return res.json({
            success: true,
            orderId: order._id,
            chargeId: order.pgChargeId,
            status: order.status,
            qrCodeText: order.pixQrCodeText,
            qrCodeLink: order.pixQrCodeLink,
            expiresAt: order.pixExpiration || new Date(Date.now() + 3600000).toISOString(),
            total: order.total
        });
    }

    // Buscar informações atualizadas da cobrança no PagSeguro
    try {
      let data;
      
      console.log("🚀 DEBUG: Starting Smart Routing Logic");
      console.log(`🚀 DEBUG: chargeId prefix: ${chargeId.substring(0, 5)}`);

      // Estratégia 1: Tentar buscar pelo ID direto (Smart Routing)
      try {
        if (chargeId.startsWith('ORDE_')) {
            console.log("🔍 getPixQrCode - ID de Ordem detectado, consultando /orders");
            const response = await pagseguroApi.get(`/orders/${chargeId}`);
            data = response.data;
            console.log("✅ getPixQrCode - Sucesso em /orders");
        } else if (chargeId.startsWith('CHAR_')) {
            console.log("🔍 getPixQrCode - ID de Charge detectado, consultando /charges");
            const response = await pagseguroApi.get(`/charges/${chargeId}`);
            data = response.data;
            console.log("✅ getPixQrCode - Sucesso em /charges");
        } else {
            // Se não tiver prefixo conhecido, tenta orders primeiro (padrão)
            console.log("🔍 getPixQrCode - ID sem prefixo conhecido, tentando /orders");
            const response = await pagseguroApi.get(`/orders/${chargeId}`);
            data = response.data;
            console.log("✅ getPixQrCode - Sucesso em /orders (default)");
        }
      } catch (directError) {
        console.log("⚠️ Falha na busca direta:", directError.message);
        if (directError.response) {
            console.log("⚠️ Detalhes do erro direto:", JSON.stringify(directError.response.data, null, 2));
        }
        
        // Estratégia 2: Fallback para busca por reference_id
        const referenceId = order._id.toString();
        console.log("🔄 getPixQrCode - Tentando fallback por reference_id:", referenceId);
        
        const response = await pagseguroApi.get(`/orders?reference_id=${referenceId}`);
        
        if (response.data && response.data.orders && response.data.orders.length > 0) {
            data = response.data.orders[0];
            console.log("✅ getPixQrCode - Ordem encontrada via reference_id");
        } else {
            console.log("❌ getPixQrCode - Fallback falhou: Nenhuma ordem encontrada com este reference_id");
            throw new Error("Ordem não encontrada nem via ID direto nem via reference_id");
        }
      }
      
      console.log("📊 getPixQrCode - Resposta PagSeguro:", { 
        hasData: !!data, 
        status: data?.status,
        hasPix: !!data?.pix,
        hasQrCodes: !!data?.qr_codes?.length,
        dataKeys: data ? Object.keys(data) : [],
        // fullData: JSON.stringify(data, null, 2) // Comentado para não poluir demais, descomentar se necessário
      });
      
      if (!data) {
        console.log("❌ getPixQrCode - Dados não encontrados no PagSeguro");
        return res.status(404).json({ error: "Cobrança não encontrada no PagSeguro" });
      }

      // Extrair QR Code PIX - tentar diferentes estruturas possíveis
      let qrCode = null;
      
      // Tentar diferentes campos onde o PIX pode estar
      if (data.pix) {
        qrCode = data.pix;
      } else if (data.qr_codes && data.qr_codes.length > 0) {
        qrCode = data.qr_codes[0];
      } else if (data.payment_methods && data.payment_methods.length > 0) {
        // PIX pode estar dentro de payment_methods
        const pixMethod = data.payment_methods.find(pm => pm.type === 'PIX');
        if (pixMethod) {
          qrCode = pixMethod.pix || pixMethod.qr_code;
        }
      } else if (data.charges && data.charges.length > 0) {
        // PIX pode estar dentro de charges
        const pixCharge = data.charges.find(c => c.payment_method?.type === 'PIX');
        if (pixCharge) {
          qrCode = pixCharge.pix || pixCharge.qr_code;
        }
      } else if (data.orders && data.orders.length > 0) {
        // PIX pode estar dentro de orders
        const pixOrder = data.orders.find(o => o.payment_method?.type === 'PIX');
        if (pixOrder) {
          qrCode = pixOrder.pix || pixOrder.qr_code;
        }
      }
      
      // Se ainda não encontrou, tentar buscar em qualquer campo que contenha 'pix' ou 'qr'
      if (!qrCode) {
        const searchForPix = (obj, depth = 0) => {
          if (depth > 3) return null; // Evitar recursão muito profunda
          
          if (obj && typeof obj === 'object') {
            for (const [key, value] of Object.entries(obj)) {
              if (key.toLowerCase().includes('pix') || key.toLowerCase().includes('qr')) {
                if (value && typeof value === 'object' && (value.text || value.qrcode || value.href)) {
                  return value;
                }
              }
              if (typeof value === 'object' && value !== null) {
                const found = searchForPix(value, depth + 1);
                if (found) return found;
              }
            }
          }
          return null;
        };
        
        qrCode = searchForPix(data);
      }
      
      console.log("🔍 getPixQrCode - QR Code extraído:", { 
        hasQrCode: !!qrCode,
        hasText: !!qrCode?.text,
        hasLinks: !!qrCode?.links?.length,
        qrCodeStructure: qrCode ? Object.keys(qrCode) : []
      });
      
      if (!qrCode) {
        console.log("❌ getPixQrCode - QR Code não disponível na consulta atual");
        // Retornar informações básicas mesmo sem QR Code
        return res.json({
          success: true,
          orderId: order._id,
          chargeId: data.id || chargeId,
          status: data.status || 'WAITING',
          qrCodeText: null,
          qrCodeLink: null,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          total: order.total,
          message: "QR Code PIX não disponível no momento. Tente novamente em alguns instantes."
        });
      }

      const response = {
        success: true,
        orderId: order._id,
        chargeId: data.id,
        status: data.status,
        qrCodeText: qrCode?.text || qrCode?.qrcode,
        qrCodeLink: qrCode?.links?.[0]?.href || qrCode?.href,
        expiresAt: qrCode?.expiration_date || new Date(Date.now() + 3600000).toISOString(),
        total: order.total
      };

      console.log("✅ getPixQrCode - Retornando resposta:", { 
        success: response.success,
        orderId: response.orderId,
        hasQrCodeText: !!response.qrCodeText,
        hasQrCodeLink: !!response.qrCodeLink
      });

      return res.json(response);

    } catch (apiError) {
      console.error("❌ getPixQrCode - Erro ao consultar PagSeguro (CATCH EXTERNO):", {
        status: apiError.response?.status,
        data: apiError.response?.data,
        message: apiError.message
      });
      return res.status(500).json({ error: "Erro ao consultar informações do pagamento" });
    }

  } catch (error) {
    console.error("❌ getPixQrCode - Erro geral:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export { createPix, createCreditCardPayment, handleWebhook, getPaymentStatus, getPixQrCode };
