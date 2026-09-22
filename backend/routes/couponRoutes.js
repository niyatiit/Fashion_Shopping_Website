import express from "express";
import {
  applyCoupon,
  createCoupon,
  getCoupons,
  toggleCoupon,
  deleteCoupon,
  seedSampleCoupons,
} from "../controllers/couponController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/apply", protect, applyCoupon);

router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, createCoupon);
router.post("/seed-samples", protect, admin, seedSampleCoupons);
router.patch("/:id/toggle", protect, admin, toggleCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

export default router;