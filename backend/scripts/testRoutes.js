// /backend/scripts/testRoutes.js - VERSÃO FINAL
import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";
const TEST_TOKEN = process.env.TEST_TOKEN;

if (!TEST_TOKEN) {
  console.log("❌ TEST_TOKEN não definido no .env");
  process.exit(1);
}

// Conectar ao MongoDB para buscar dados reais
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");
    return true;
  } catch (error) {
    console.log("⚠️  Não conectado ao MongoDB, usando dados de teste");
    return false;
  }
};

// Buscar ID real de produto
const getRealProductId = async () => {
  try {
    const productsCollection = mongoose.connection.db.collection("products");
    const product = await productsCollection.findOne({});
    return product ? product._id.toString() : "65a1b2c3d4e5f67890123456";
  } catch (error) {
    return "65a1b2c3d4e5f67890123456";
  }
};

// Buscar ID real de pedido ou criar um de teste
const getRealOrderId = async () => {
  try {
    const ordersCollection = mongoose.connection.db.collection("orders");
    const order = await ordersCollection.findOne({});
    if (order) return order._id.toString();

    // Se não houver pedidos, criar um para teste
    const testOrder = {
      user: new mongoose.Types.ObjectId(),
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          name: "Produto Teste",
          price: 99.9,
          quantity: 1,
          color: "Preto",
          size: "M",
          image: "test.jpg",
        },
      ],
      shippingAddress: {
        address: "Rua Teste",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        postalCode: "01001-000",
        country: "Brasil",
      },
      paymentMethod: "Mercado Pago",
      itemsPrice: 99.9,
      taxPrice: 9.99,
      shippingPrice: 15.0,
      total: 124.89,
      status: "Pendente",
      isPaid: false,
      createdAt: new Date(),
    };

    const result = await ordersCollection.insertOne(testOrder);
    return result.insertedId.toString();
  } catch (error) {
    return new mongoose.Types.ObjectId().toString();
  }
};

const testRoutes = async () => {
  const isConnected = await connectDB();

  // Buscar IDs reais
  const realProductId = await getRealProductId();
  const realOrderId = isConnected
    ? await getRealOrderId()
    : new mongoose.Types.ObjectId().toString();

  const validCartItems = [
    {
      id: realProductId,
      name: "Camiseta Fitness",
      price: 79.9,
      quantity: 2,
      color: "Preto",
      size: "M",
      image: "https://exemplo.com/camiseta.jpg",
    },
  ];

  const validShippingAddress = {
    logradouro: "Rua Exemplo",
    numero: "123",
    complemento: "Sala 1",
    bairro: "Centro",
    localidade: "São Paulo",
    uf: "SP",
    cep: "01001-000",
  };

  console.log("🧪 Testando rotas da API...\n");
  console.log("🔑 Token:", TEST_TOKEN.substring(0, 20) + "...");
  console.log("📦 Product ID:", realProductId);
  console.log("📦 Order ID:", realOrderId);

  const tests = [
    {
      name: "Health Check",
      method: "GET",
      url: `${BASE_URL}/api/health`,
      expectedStatus: 200,
      auth: false,
    },
    {
      name: "Health Check Detalhado",
      method: "GET",
      url: `${BASE_URL}/api/health/detailed`,
      expectedStatus: 200,
      auth: false,
    },
    {
      name: "Criar PIX (Dados válidos)",
      method: "POST",
      url: `${BASE_URL}/api/payment/create-pix`,
      data: {
        cartItems: validCartItems,
        shippingAddress: validShippingAddress
      },
      expectedStatus: 201,
      auth: true,
    },
    {
      name: "Criar PIX (Sem dados - deve falhar)",
      method: "POST",
      url: `${BASE_URL}/api/payment/create-pix`,
      data: {},
      expectedStatus: 400,
      auth: true,
    },
    {
      name: "Criar PIX (Sem auth - deve falhar)",
      method: "POST",
      url: `${BASE_URL}/api/payment/create-pix`,
      data: { cartItems: validCartItems },
      expectedStatus: 401,
      auth: false,
    },
  ];

  for (const test of tests) {
    try {
      const config = {
        method: test.method,
        url: test.url,
        timeout: 10000,
        validateStatus: () => true,
      };

      if (test.data) {
        config.data = test.data;
        config.headers = {
          "Content-Type": "application/json",
          ...config.headers,
        };
      }

      if (test.auth) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${TEST_TOKEN}`,
        };
      }

      console.log(`\n🔍 Testando: ${test.name}`);
      const response = await axios(config);

      const passed = response.status === test.expectedStatus;
      console.log(
        passed ? "✅" : "❌",
        `Status: ${response.status} (Esperado: ${test.expectedStatus})`
      );

      if (!passed && response.data) {
        console.log("📋 Resposta:", JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.log("❌ ERRO:", error.message);
    }
  }

  // Fechar conexão
  if (isConnected) {
    await mongoose.connection.close();
    console.log("\n✅ Conexão com MongoDB fechada");
  }
};

testRoutes().catch(console.error);
