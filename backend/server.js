import "./src/config/env.js"; // Must be the first import
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
import newsletterRoutes from './src/routes/newsletter.js';
import couponRoutes from './src/routes/coupons.js';
import reviewRoutes from './src/routes/reviews.js';
import analyticsRoutes from './src/routes/analytics.js';

// dotenv configured in ./src/config/env.js

const app = express();

// Confiar no IP original através do Load Balancer (Render, Vercel, Heroku etc)
app.set("trust proxy", 1);

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

// CORS (DEVE VIR ANTES DO RATE LIMIT)
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://ammifitwear.com.br",
        "https://www.ammifitwear.com.br",
      ];

      if (process.env.CORS_ORIGIN) {
        allowedOrigins.push(process.env.CORS_ORIGIN.replace(/\/$/, ""));
      }

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Rate limiting (Tolerância aumentada para evitar falsos erros de CORS)
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT_MAX || 1000, // Aumentado de 100 para 1000
});
app.use(limiter);

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
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

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
