import express from "express";
import {
  createProduct,
  getAllProducts,
  getBestSellers,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Image upload failed" });
    }
    next();
  });
};

// Helper to convert multer's uploaded files into our {url, public_id} format
const formatImages = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));
  }
  next();
};

router.get("/", getAllProducts);
router.get("/best-sellers", getBestSellers);
router.get("/:id", getProductById);

router.post("/", protect, admin, handleUpload, formatImages, createProduct);
router.put("/:id", protect, admin, handleUpload, formatImages, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;