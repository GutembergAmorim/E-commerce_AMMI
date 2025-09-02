// /backend/routes/health.js
import express from 'express';
import mongoose from 'mongoose'; // ← ADICIONAR IMPORT

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with dependencies
 * @access  Public
 */
router.get('/health/detailed', async (req, res) => {
  try {
    const healthInfo = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV
      },
      dependencies: {
        database: 'unknown',
        mercadopago: 'unknown'
      }
    };

    // Verificar MongoDB se estiver conectado
    if (mongoose.connection.readyState === 1) {
      healthInfo.dependencies.database = 'connected';
      // Testar uma query simples
      try {
        await mongoose.connection.db.admin().ping();
        healthInfo.dependencies.database = 'healthy';
      } catch (error) {
        healthInfo.dependencies.database = 'error';
        healthInfo.databaseError = error.message;
      }
    } else {
      healthInfo.dependencies.database = 'disconnected';
    }

    res.status(200).json(healthInfo);
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      error: error.message 
    });
  }
});

export default router;