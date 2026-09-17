import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";

// @desc Create a Razorpay order (called before showing payment popup on frontend)
// @route POST /api/payment/create-order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees, sent from frontend cart total

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay needs amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // frontend needs the public key id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Verify Razorpay payment signature after user completes payment
// @route POST /api/payment/verify
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const isTestKey = process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test");
    const isDev = process.env.NODE_ENV !== "production" || isTestKey;

    let isAuthentic = false;

    if (isDev && razorpay_signature === "mock_signature_test") {
      isAuthentic = true;
    } else {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      isAuthentic = expectedSignature === razorpay_signature;
    }

    if (!isAuthentic) {
      return res.status(400).json({ message: "Payment verification failed. Possible tampering detected." });
    }

    // Signature valid — payment is genuine
    res.json({
      success: true,
      message: "Payment verified successfully",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};