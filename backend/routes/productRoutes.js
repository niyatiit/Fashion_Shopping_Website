import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

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
router.get("/:id", getProductById);

router.post("/", protect, admin, upload.array("images", 5), formatImages, createProduct);
router.put("/:id", protect, admin, upload.array("images", 5), formatImages, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;