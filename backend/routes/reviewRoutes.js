import express from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getMyReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Must come before "/:productId" — otherwise "user" would be read as a product id.
router.get("/user/my-reviews", protect, getMyReviews);

router.get("/:productId", getProductReviews);
router.post("/:productId", protect, createReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;