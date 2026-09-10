import Review from "../models/Review.js";
import Product from "../models/Product.js";

// Helper: recalculate product's average rating and review count
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const numReviews = reviews.length;
  const ratings =
    numReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
      : 0;

  await Product.findByIdAndUpdate(productId, {
    ratings: ratings.toFixed(1),
    numReviews,
  });
};

// @desc Create a review for a product
// @route POST /api/reviews/:productId
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId,
    });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product. Please update your existing review instead." });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    await updateProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all reviews for a product
// @route GET /api/reviews/:productId
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update own review
// @route PUT /api/reviews/:reviewId
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this review" });
    }

    const { rating, comment } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();
    await updateProductRating(review.product);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete own review (or Admin can delete any)
// @route DELETE /api/reviews/:reviewId
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged-in user's own reviews
// @route GET /api/reviews/user/mine
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).populate("product", "name images");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};