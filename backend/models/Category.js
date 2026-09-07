import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String, // Cloudinary URL
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null = top-level category (e.g., "Men", "Women", "Kids")
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);