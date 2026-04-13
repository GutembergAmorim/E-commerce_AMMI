import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import errorHandler from "./src/middleware/errorHandler.js";
import healthRoutes from "./src/routes/health.js";

// Importação das rotas
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

const app = express();

app.set("trust proxy", 1);

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

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 1000,
});
app.use(limiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

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

app.get("/", (req, res) => {
  res.json({
    message: "API AMII - E-commerce de Roupas Fitness",
    version: "1.0.0",
    status: "online",
  });
});

app.use(errorHandler);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

export default app;
