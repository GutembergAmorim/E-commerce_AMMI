import "./src/config/env.js"; // Must be the first import
import app from "./app.js";
import connectDB from "./src/config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // 1. Tenta conectar ao banco de dados
    app.listen(PORT, () => {
      // 2. Só inicia o servidor se a conexão for bem-sucedida
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);

      // ── Keep-alive: pinga a si mesmo a cada 14min para evitar cold start no Render ──
      if (process.env.NODE_ENV === 'production' && process.env.KEEP_ALIVE_URL) {
        const keepAliveInterval = 14 * 60 * 1000; // 14 minutos
        setInterval(async () => {
          try {
            const res = await fetch(process.env.KEEP_ALIVE_URL);
            console.log(`🏓 Keep-alive ping: ${res.status}`);
          } catch (e) {
            console.log(`⚠️ Keep-alive ping failed: ${e.message}`);
          }
        }, keepAliveInterval);
        console.log(`🏓 Keep-alive ativado: ping a cada 14min → ${process.env.KEEP_ALIVE_URL}`);
      }
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor:", error.message);
    process.exit(1); // Encerra o processo com um código de erro
  }
};

startServer();
