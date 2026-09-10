import Wishlist from "../models/Wishlist.js";

// @desc Get logged-in user's wishlist
// @route GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
      "name price discountPrice images stock"
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add product to wishlist
// @route POST /api/wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const alreadyExists = wishlist.products.some(
      (p) => p.toString() === req.params.productId
    );

    if (!alreadyExists) {
      wishlist.products.push(req.params.productId);
      await wishlist.save();
    }

    const populated = await wishlist.populate("products", "name price discountPrice images stock");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Remove product from wishlist
// @route DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== req.params.productId
    );
    await wishlist.save();

    const populated = await wishlist.populate("products", "name price discountPrice images stock");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};