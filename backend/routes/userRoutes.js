import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getAllUsers,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put(
  "/profile",
  protect,
  upload.single("profileImage"),
  (req, res, next) => {
    if (req.file) {
      req.body.profileImage = { url: req.file.path, public_id: req.file.filename };
    }
    next();
  },
  updateUserProfile
);

router.put("/change-password", protect, changePassword);

router.post("/address", protect, addAddress);
router.put("/address/:addressId", protect, updateAddress);
router.put("/address/:addressId/default", protect, setDefaultAddress);
router.delete("/address/:addressId", protect, deleteAddress);

router.get("/", protect, admin, getAllUsers);

export default router;