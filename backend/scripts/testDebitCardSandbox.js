/**
 * Script de teste para requisição Cartão de Débito (3DS) no sandbox do PagSeguro
 * Gera logs completos de REQUEST e RESPONSE para validação
 * 
 * NOTA: 3DS requer interação do browser, então este script testa apenas:
 * 1. Criação da sessão 3DS
 * 2. Estrutura do body que seria enviado ao POST /orders
 * 
 * Para testar o fluxo completo, use o frontend.
 * 
 * Uso: node scripts/testDebitCardSandbox.js
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

async function testDebitCardPayment() {
  const separator = "=".repeat(80);
  const logLines = [];

  const log = (msg) => {
    console.log(msg);
    logLines.push(msg);
  };

  log(separator);
  log("TESTE DE INTEGRAÇÃO CARTÃO DE DÉBITO (3DS) — SANDBOX PAGBANK");
  log(`Data: ${new Date().toISOString()}`);
  log(separator);

  // ===================== STEP 1: Criar sessão 3DS =====================
  log("");
  log("╔══════════════════════════════════════════════════════════════════╗");
  log("║           STEP 1: CRIAR SESSÃO 3DS — REQUEST                   ║");
  log("╚══════════════════════════════════════════════════════════════════╝");
  log("");

  const sessionUrl = "https://sandbox.sdk.pagseguro.com/checkout-sdk/sessions";
  log(`Endpoint: POST ${sessionUrl}`);
  log("");
  log("Headers:");
  log(JSON.stringify({
    "Authorization": `Bearer ${TOKEN.substring(0, 15)}...`,
    "Content-Type": "application/json"
  }, null, 2));

  let session = null;

  try {
    const sessionResponse = await axios.post(sessionUrl, {}, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    });

    log("");
    log("╔══════════════════════════════════════════════════════════════════╗");
    log("║           STEP 1: CRIAR SESSÃO 3DS — RESPONSE                  ║");
    log("╚══════════════════════════════════════════════════════════════════╝");
    log("");
    log(`HTTP Status: ${sessionResponse.status} ${sessionResponse.statusText}`);
    log("");
    log("Response Body:");
    log(JSON.stringify(sessionResponse.data, null, 2));

    session = sessionResponse.data.session;

  } catch (error) {
    log("");
    log("╔══════════════════════════════════════════════════════════════════╗");
    log("║           STEP 1: CRIAR SESSÃO 3DS — ERRO                      ║");
    log("╚══════════════════════════════════════════════════════════════════╝");
    log("");
    log(`HTTP Status: ${error.response?.status || "N/A"}`);
    log(JSON.stringify(error.response?.data || error.message, null, 2));
  }

  // ===================== STEP 2: Body do POST /orders (débito) =====================
  log("");
  log("╔══════════════════════════════════════════════════════════════════╗");
  log("║           STEP 2: BODY DO POST /orders (DÉBITO COM 3DS)        ║");
  log("╚══════════════════════════════════════════════════════════════════╝");
  log("");
  log("NOTA: O fluxo completo requer autenticação 3DS via browser/SDK.");
  log("Abaixo está a estrutura do body que é enviado após a autenticação.");
  log("");

  const idempotencyKey = crypto.randomUUID();
  const orderBody = {
    reference_id: `test-debit-${Date.now()}`,
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
    ],
    charges: [
      {
        reference_id: "charge-test-debit",
        description: "Pedido de teste débito",
        amount: {
          value: 12990,
          currency: "BRL"
        },
        payment_method: {
          type: "DEBIT_CARD",
          card: {
            encrypted: "<ENCRYPTED_CARD_VIA_SDK>",
            store: false
          },
          holder: {
            name: "Jose da Silva",
            tax_id: "12345678909"
          }
        },
        authentication_method: {
          type: "THREEDS",
          id: "<3DS_AUTHENTICATION_ID_VIA_SDK>"
        }
      }
    ]
  };

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
  log(JSON.stringify(orderBody, null, 2));

  log("");
  log("╔══════════════════════════════════════════════════════════════════╗");
  log("║                       INFORMAÇÕES                              ║");
  log("╚══════════════════════════════════════════════════════════════════╝");
  log("");
  log("Para testar o fluxo COMPLETO de débito com 3DS:");
  log("1. Inicie o frontend (npm run dev) e backend (npm run dev)");
  log("2. Vá ao checkout e selecione 'Débito'");
  log("3. Use o cartão de teste: 4000 0000 0000 2701 (12/2030, CVV 123)");
  log("4. Complete a autenticação 3DS no popup do banco");
  log("5. Os logs completos aparecerão no terminal do backend");

  log("");
  log(separator);
  log("FIM DO TESTE");
  log(separator);

  // Salvar log em arquivo
  const logPath = path.resolve(__dirname, "../logs_debit_sandbox.txt");
  fs.writeFileSync(logPath, logLines.join("\n"), "utf-8");
  console.log(`\n📄 Log salvo em: ${logPath}`);
}

testDebitCardPayment();
