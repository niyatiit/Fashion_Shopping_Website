import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Helper: recalculate cart's total price
const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

// @desc Get logged-in user's cart
// @route GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name images stock price discountPrice"
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add item to cart
// @route POST /api/cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock === 0) {
      return res.status(400).json({ message: "This product is out of stock" });
    }

    // Require a size/color pick when the product actually offers a choice
    if (product.sizes?.length > 0 && !size) {
      return res.status(400).json({ message: "Please select a size" });
    }
    if (product.colors?.length > 0 && !color) {
      return res.status(400).json({ message: "Please select a color" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if same product+size+color already in cart
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    const requestedQuantity = (existingItem ? existingItem.quantity : 0) + Number(quantity);
    if (requestedQuantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} unit(s) of this product are in stock`,
      });
    }

    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    if (existingItem) {
      existingItem.quantity = requestedQuantity;
      existingItem.price = effectivePrice; // keep price fresh
    } else {
      cart.items.push({
        product: productId,
        quantity,
        size,
        color,
        price: effectivePrice,
      });
    }

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const populatedCart = await cart.populate("items.product", "name images stock price discountPrice");
    res.status(201).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update quantity of a cart item
// @route PUT /api/cart/:itemId
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: "This product is no longer available" });
    }
    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} unit(s) of this product are in stock`,
      });
    }

    item.quantity = quantity;
    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const populatedCart = await cart.populate("items.product", "name images stock price discountPrice");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Remove item from cart
// @route DELETE /api/cart/:itemId
export const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemExists = cart.items.some((item) => item._id.toString() === req.params.itemId);
    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const populatedCart = await cart.populate("items.product", "name images stock price discountPrice");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Clear entire cart
// @route DELETE /api/cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};