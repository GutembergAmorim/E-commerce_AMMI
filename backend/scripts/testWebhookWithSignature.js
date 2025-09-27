// Script de teste simples para webhook PagSeguro (sem assinatura)
import axios from "axios";

const testWebhook = async () => {
  const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
  const testData = { id: "ch_1234567890" };
  try {
    const response = await axios.post(`${baseUrl}/api/payment/webhook`, testData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("✅ Webhook test status:", response.status);
  } catch (error) {
    console.log("❌ Erro no teste:", error.response?.data || error.message);
  }
};

testWebhook();
