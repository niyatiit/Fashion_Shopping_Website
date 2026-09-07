import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

router.post("/", protect, admin, upload.single("image"), (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.path; // Cloudinary URL from multer-storage-cloudinary
  }
  next();
}, createCategory);

router.put("/:id", protect, admin, upload.single("image"), (req, res, next) => {
  if (req.file) {
    req.body.image = req.file.path;
  }
  next();
}, updateCategory);

router.delete("/:id", protect, admin, deleteCategory);

export default router;