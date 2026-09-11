import Coupon from "../models/Coupon.js";

// @desc Validate a coupon code against the current cart total and return the discount
// @route POST /api/coupons/apply
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Please enter a coupon code" });
    }
    if (cartTotal === undefined || cartTotal <= 0) {
      return res.status(400).json({ message: "Your bag is empty" });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: "Invalid or inactive coupon code" });
    }
    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: "This coupon has expired" });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "This coupon has reached its usage limit" });
    }
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Add items worth ₹${coupon.minOrderValue - cartTotal} more to use this coupon`,
      });
    }

    let discountAmount =
      coupon.discountType === "percentage"
        ? (cartTotal * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.discountType === "percentage" && coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
    discountAmount = Math.round(Math.min(discountAmount, cartTotal));

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a coupon (Admin only)
// @route POST /api/coupons
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit } =
      req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const exists = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "A coupon with this code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || undefined,
      expiryDate,
      usageLimit: usageLimit || undefined,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all coupons (Admin only)
// @route GET /api/coupons
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Toggle a coupon's active status (Admin only)
// @route PATCH /api/coupons/:id/toggle
export const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a coupon (Admin only)
// @route DELETE /api/coupons/:id
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    await coupon.deleteOne();
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};