// /backend/scripts/checkTunnel.js
import axios from "axios";

const checkTunnel = async (url) => {
  try {
    console.log("🔍 Verificando tunnel:", url);

    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true, // Aceitar qualquer status
    });

    console.log("✅ Tunnel respondendo. Status:", response.status);
    return true;
  } catch (error) {
    console.log("❌ Tunnel não disponível:", error.message);
    return false;
  }
};

// Testar
checkTunnel("https://ammi-fitness.loca.lt");
