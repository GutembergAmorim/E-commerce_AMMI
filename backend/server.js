import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./src/config/database.js";
import errorHandler from "./src/middleware/errorHandler.js";
import healthRoutes from "./src/routes/health.js";

// Importação das rotas com ES Modules
import authRoutes from "./src/routes/auth.js";
import productRoutes from "./src/routes/products.js";
import uploadRoutes from "./src/routes/upload.js";
import userRoutes from "./src/routes/users.js";
import paymentRoutes from "./src/routes/payment.js";
import orderRoutes from './src/routes/orderRoutes.js';
import stockRoutes from './src/routes/stockRoutes.js';

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

// Middleware de segurança
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT_MAX || 100, // limite por IP
});
app.use(limiter);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use('/api/orders', orderRoutes)
app.use('/api/stock', stockRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    message: "API AMII - E-commerce de Roupas Fitness",
    version: "1.0.0",
    status: "online",
  });
});

// Middleware de erro
app.use(errorHandler);

// Rota 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // 1. Tenta conectar ao banco de dados
    app.listen(PORT, () => {
      // 2. Só inicia o servidor se a conexão for bem-sucedida
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor:", error.message);
    process.exit(1); // Encerra o processo com um código de erro
  }
};

startServer();
