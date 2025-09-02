// /backend/scripts/testWebhookSignature.js
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const testWebhookSignature = async () => {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

  if (!webhookSecret) {
    console.log('❌ MERCADOPAGO_WEBHOOK_SECRET não configurado');
    return;
  }

  const testData = {
    type: 'payment',
    data: {
      id: 'test_123456789',
      external_reference: '65a1b2c3d4e5f67890123456'
    }
  };

  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `${timestamp}.${JSON.stringify(testData)}`;
  
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  const fullSignature = `version=1,ts=${timestamp},sig=${signature}`;

  try {
    const response = await axios.post(`${baseUrl}/api/payment/webhook`, testData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': fullSignature
      }
    });

    console.log('✅ Teste de assinatura:', response.status);
  } catch (error) {
    console.log('❌ Erro no teste:', error.response?.data || error.message);
  }
};

testWebhookSignature();