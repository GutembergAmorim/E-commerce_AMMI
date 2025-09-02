// /backend/scripts/testRedirectUrls.js - SCRIPT ATUALIZADO
import { URL } from "url";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Função para validar URL
const validateClientURL = () => {
  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    throw new Error("CLIENT_URL não está definido nas variáveis de ambiente.");
  }

  try {
    const url = new URL(clientUrl);

    // Remover qualquer path que possa ter sido adicionado acidentalmente
    const cleanUrl = `${url.origin}`;

    // Validar protocolo
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("CLIENT_URL deve usar HTTP ou HTTPS");
    }

    console.log("✅ CLIENT_URL validada:", cleanUrl);
    return cleanUrl;
  } catch (err) {
    throw new Error(`CLIENT_URL inválido: ${clientUrl} - ${err.message}`);
  }
};

// Script principal
const testRedirectUrls = () => {
  try {
    console.log("🧪 Testando URLs de redirecionamento...");
    console.log("Diretório atual:", __dirname);
    console.log("CLIENT_URL from env:", process.env.CLIENT_URL);
    console.log("BACKEND_URL from env:", process.env.BACKEND_URL);

    if (!process.env.CLIENT_URL) {
      console.log("❌ CLIENT_URL não definida. Verifique o arquivo .env");
      console.log(
        "💡 Dica: Certifique-se de que o arquivo .env está na pasta backend"
      );
      return;
    }

    const clientUrl = validateClientURL();
    const testOrderId = "65a1b2c3d4e5f67890123456";

    const urls = {
      success: `${clientUrl}/payment/success?orderId=${testOrderId}`,
      failure: `${clientUrl}/payment/failure?orderId=${testOrderId}`,
      pending: `${clientUrl}/payment/pending?orderId=${testOrderId}`,
    };

    console.log("\n📋 URLs geradas:");
    Object.entries(urls).forEach(([type, url]) => {
      console.log(`   ${type.toUpperCase()}: ${url}`);
    });

    // Verificar se são URLs válidas
    console.log("\n🔍 Validando URLs:");
    Object.entries(urls).forEach(([type, url]) => {
      try {
        new URL(url);
        console.log(`   ✅ ${type} URL válida`);
      } catch (error) {
        console.log(`   ❌ ${type} URL inválida: ${error.message}`);
      }
    });
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
};

// Executar o teste
testRedirectUrls();
