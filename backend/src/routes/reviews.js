import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
  toggleApproval,
} from "../controllers/reviewController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/product/:productId", getProductReviews);

// Private (logged in users)
router.post("/", protect, createReview);
router.delete("/:id", protect, deleteReview);

// Admin
router.get("/", protect, admin, getAllReviews);
router.put("/:id/approve", protect, admin, toggleApproval);

export default router;
