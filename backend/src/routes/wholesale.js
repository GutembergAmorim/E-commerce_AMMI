import express from "express";
import { protect, admin } from "../middleware/auth.js";
import { getConfig, getAdminConfig, updateConfig } from "../controllers/wholesaleController.js";

const router = express.Router();

// Público — frontend usa para exibir regras de atacado
router.get("/config", getConfig);

// Admin — gerenciar configuração
router.get("/admin", protect, admin, getAdminConfig);
router.put("/admin", protect, admin, updateConfig);

export default router;
