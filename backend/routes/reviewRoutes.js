import express from "express";
import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user/mine", protect, getMyReviews);
router.get("/:productId", getProductReviews);
router.post("/:productId", protect, createReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;