import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import sendEmail, { getBrandedEmailTemplate } from "../utils/sendEmail.js";

// @desc Create new order (COD or after Razorpay payment verified)
// @route POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      couponCode,
      discountAmount,
      totalPrice,
      paymentInfo,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }
    if (!["COD", "Razorpay", "Card", "Online"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Please select a valid payment method" });
    }

    // Ensure all items have a valid image fallback so validation never fails
    const sanitizedOrderItems = orderItems.map((item) => ({
      ...item,
      image: item.image || "https://placehold.co/400x500?text=No+Image",
    }));

    const products = [];
    for (const item of sanitizedOrderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${product.stock} unit(s) of "${product.name}" are in stock`,
        });
      }
      products.push({ product, quantity: item.quantity });
    }

    for (const { product, quantity } of products) {
      product.stock -= quantity;
      await product.save();
    }

    const isOnlinePaid = ["Razorpay", "Card", "Online"].includes(paymentMethod);

    const order = await Order.create({
      user: req.user._id,
      orderItems: sanitizedOrderItems,
      shippingAddress,
      paymentMethod,
      paymentInfo: paymentInfo || {},
      isPaid: isOnlinePaid,
      paidAt: isOnlinePaid ? Date.now() : null,
      itemsPrice,
      shippingPrice,
      couponCode: couponCode || undefined,
      discountAmount: discountAmount || 0,
      totalPrice,
    });

    if (couponCode) {
      try {
        await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
      } catch (couponErr) {
        console.error("Could not update coupon usage:", couponErr.message);
      }
    }

    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalPrice: 0 }
    );

    // Send confirmation email asynchronously (does not block response)
    (async () => {
      try {
        const orderShortId = order._id.toString().slice(-8).toUpperCase();
        const itemsListHtml = sanitizedOrderItems
          .map(
            (item) =>
              `<tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name} (${item.quantity}x) ${item.size ? `· Size: ${item.size}` : ""}</td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
              </tr>`
          )
          .join("");

        const emailContent = `
          <p>Hi ${shippingAddress.fullName || req.user.name},</p>
          <p>Thank you for your purchase! We're preparing your order <strong>#${orderShortId}</strong>.</p>
          <div style="background: #faf9f7; border: 1px solid #e7e5e0; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-weight: 600;">Order Summary:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              ${itemsListHtml}
              <tr>
                <td style="padding: 8px 0; color: #76726d;">Shipping:</td>
                <td style="padding: 8px 0; text-align: right; color: #76726d;">${shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}</td>
              </tr>
              ${discountAmount > 0 ? `<tr><td style="padding: 8px 0; color: #8C1D18;">Discount:</td><td style="padding: 8px 0; text-align: right; color: #8C1D18;">-₹${discountAmount}</td></tr>` : ""}
              <tr style="font-weight: 600; font-size: 16px;">
                <td style="padding: 12px 0 0 0; border-top: 2px solid #161412;">Total Paid:</td>
                <td style="padding: 12px 0 0 0; text-align: right; border-top: 2px solid #161412;">₹${totalPrice}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 13px; color: #76726d;">
            <strong>Shipping to:</strong><br/>
            ${shippingAddress.fullName}<br/>
            ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br/>
            Phone: ${shippingAddress.phone}
          </p>
        `;

        await sendEmail({
          to: req.user.email,
          subject: `Order Confirmed: #${orderShortId}`,
          html: getBrandedEmailTemplate({
            title: `Order #${orderShortId} Confirmed!`,
            bodyContent: emailContent,
            buttonText: "View Order Details",
            buttonUrl: `${process.env.CLIENT_URL}/orders/${order._id}`,
          }),
        });
      } catch (mailErr) {
        console.error("Order confirmation email error:", mailErr.message);
      }
    })();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged-in user's orders
// @route GET /api/orders/myorders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single order by ID (owner or admin)
// @route GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all orders (Admin only)
// @route GET /api/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update order status (Admin only)
// @route PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered") {
      order.deliveredAt = Date.now();
    }

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Cancel own order (only if still Processing)
// @route PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (order.orderStatus !== "Processing") {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    }

    order.orderStatus = "Cancelled";

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();
    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};