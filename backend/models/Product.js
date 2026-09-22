import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      default: 0, // 0 means no discount
    },
    images: [
      {
        url: { type: String, required: true }, // Cloudinary URL
        public_id: { type: String, required: true }, // Cloudinary ID (needed to delete image later)
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
      default: "Generic",
    },
    sizes: [
      {
        type: String, // e.g., "S", "M", "L", "XL"
      },
    ],
    fabric: {
      type: String,
      default: "Cotton",
      trim: true,
    },
    colors: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false, // for homepage "Featured Products" section
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);