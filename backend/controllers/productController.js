import Product from "../models/Product.js";
import Order from "../models/Order.js";
import cloudinary from "../config/cloudinary.js";

// @desc Create a new product (Admin only)
// @route POST /api/products
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      brand,
      sizes,
      colors,
      stock,
      isFeatured,
      images, // expected: array of { url, public_id } already uploaded via upload middleware
    } = req.body;

    if (!name || !description || !price || !category || !images || images.length === 0) {
      return res.status(400).json({ message: "Please provide all required fields including images" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      category,
      brand,
      sizes,
      colors,
      stock,
      isFeatured,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all products (with search, filter, sort, pagination)
// @route GET /api/products
export const getAllProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      brand,
      size,
      color,
      sort,
      isFeatured,
      onSale,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (size) {
      query.sizes = size;
    }
    if (color) {
      query.colors = color;
    }
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    if (onSale === "true") {
      query.discountPrice = { $gt: 0 };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { ratings: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(query);

    res.json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get best-selling products, ranked by units actually sold across orders
// @route GET /api/products/best-sellers
export const getBestSellers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;

    const topSellingIds = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          unitsSold: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: limit },
    ]);

    if (topSellingIds.length === 0) {
      // No orders yet — fall back to top-rated products so the section isn't empty
      const fallback = await Product.find({})
        .populate("category", "name slug")
        .sort({ ratings: -1, numReviews: -1 })
        .limit(limit);
      return res.json(fallback);
    }

    const productMap = new Map(
      topSellingIds.map((entry) => [String(entry._id), entry.unitsSold])
    );

    const products = await Product.find({ _id: { $in: [...productMap.keys()] } }).populate(
      "category",
      "name slug"
    );

    // Preserve the units-sold ranking order from the aggregation
    products.sort(
      (a, b) => productMap.get(String(b._id)) - productMap.get(String(a._id))
    );

    res.json(
      products.map((p) => ({ ...p.toObject(), unitsSold: productMap.get(String(p._id)) }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single product by ID
// @route GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name slug");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update product (Admin only)
// @route PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const fields = ["name", "description", "price", "discountPrice", "category", "brand", "sizes", "colors", "stock", "isFeatured"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // If new images are provided, replace old ones (delete old from Cloudinary first)
    if (req.body.images && req.body.images.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
      product.images = req.body.images;
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete product (Admin only)
// @route DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove images from Cloudinary before deleting product
    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};