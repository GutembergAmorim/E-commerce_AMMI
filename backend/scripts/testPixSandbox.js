/**
 * Script de teste para requisição PIX no sandbox do PagSeguro
 * Gera logs completos de REQUEST e RESPONSE para validação
 * 
 * Uso: node scripts/testPixSandbox.js
 */
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BASE_URL = process.env.PAGSEGURO_BASE_URL || "https://sandbox.api.pagseguro.com";
const TOKEN = process.env.PAGSEGURO_TOKEN;

async function testPixPayment() {
  const separator = "=".repeat(80);
  const logLines = [];

  const log = (msg) => {
    console.log(msg);
    logLines.push(msg);
  };

  log(separator);
  log("TESTE DE INTEGRAÇÃO PIX — SANDBOX PAGBANK");
  log(`Data: ${new Date().toISOString()}`);
  log(separator);

  const idempotencyKey = crypto.randomUUID();

  // Montar request body conforme documentação oficial
  const requestBody = {
    reference_id: `test-pix-${Date.now()}`,
    customer: {
      name: "Jose da Silva",
      email: "email@sandbox.pagseguro.com.br",
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
    items: [
      {
        reference_id: "item-001",
        name: "Legging Fitness Premium",
        quantity: 1,
        unit_amount: 12990
      }
    ],
    qr_codes: [
      {
        amount: {
          value: 12990
        },
        expiration_date: new Date(Date.now() + 3600000).toISOString()
      }
    ],
    shipping: {
      address: {
        street: "Avenida Brigadeiro Faria Lima",
        number: "1384",
        complement: "apto 12",
        locality: "Pinheiros",
        city: "Sao Paulo",
        region_code: "SP",
        country: "BRA",
        postal_code: "01452002"
      }
    },
    notification_urls: [
      "https://meusite.com/api/payment/webhook"
    ]
  };

  // ===================== REQUEST =====================
  log("");
  log("╔══════════════════════════════════════════════════════════════════╗");
  log("║                          REQUEST                               ║");
  log("╚══════════════════════════════════════════════════════════════════╝");
  log("");
  log(`Endpoint: POST ${BASE_URL}/orders`);
  log("");
  log("Headers:");
  log(JSON.stringify({
    "Authorization": `Bearer ${TOKEN.substring(0, 15)}...`,
    "Content-Type": "application/json",
    "x-idempotency-key": idempotencyKey
  }, null, 2));
  log("");
  log("Body:");
  log(JSON.stringify(requestBody, null, 2));

  try {
    const response = await axios.post(`${BASE_URL}/orders`, requestBody, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "*/*",
        "x-idempotency-key": idempotencyKey
      },
      timeout: 15000
    });

    // ===================== RESPONSE =====================
    log("");
    log("╔══════════════════════════════════════════════════════════════════╗");
    log("║                         RESPONSE                               ║");
    log("╚══════════════════════════════════════════════════════════════════╝");
    log("");
    log(`HTTP Status: ${response.status} ${response.statusText}`);
    log("");
    log("Response Body:");
    log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    log("");
    log("╔══════════════════════════════════════════════════════════════════╗");
    log("║                     RESPONSE (ERRO)                            ║");
    log("╚══════════════════════════════════════════════════════════════════╝");
    log("");
    log(`HTTP Status: ${error.response?.status || "N/A"}`);
    log("");
    log("Error Response Body:");
    log(JSON.stringify(error.response?.data || error.message, null, 2));
  }

  log("");
  log(separator);
  log("FIM DO TESTE");
  log(separator);

  // Salvar log em arquivo
  const logPath = path.resolve(__dirname, "../logs_pix_sandbox.txt");
  fs.writeFileSync(logPath, logLines.join("\n"), "utf-8");
  console.log(`\n📄 Log salvo em: ${logPath}`);
}

testPixPayment();
