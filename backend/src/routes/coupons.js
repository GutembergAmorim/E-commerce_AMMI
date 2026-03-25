import express from "express";
import {
  validateCoupon,
  useCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/validate", validateCoupon);

// Private
router.post("/use", protect, useCoupon);

// Admin
router.route("/").get(protect, admin, getCoupons).post(protect, admin, createCoupon);
router.route("/:id").put(protect, admin, updateCoupon).delete(protect, admin, deleteCoupon);

export default router;
