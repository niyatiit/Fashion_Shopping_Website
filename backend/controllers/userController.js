import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

const removeImageFile = async (publicId) => {
  if (!publicId) return;
  if (publicId.startsWith("local_")) {
    const filename = publicId.replace("local_", "");
    const fullPath = path.join(uploadsDir, filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.warn("Could not delete local file:", err.message);
      }
    }
  } else {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn("Could not destroy Cloudinary image:", err.message);
    }
  }
};

// @desc Get logged-in user's profile
// @route GET /api/users/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update logged-in user's profile (name, email, phone, profile image)
// @route PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, phone } = req.body;

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const phoneTaken = await User.findOne({ phone, _id: { $ne: user._id } });
      if (phoneTaken) return res.status(400).json({ message: "Phone number already in use" });
      user.phone = phone;
    }

    if (name) user.name = name;

    if (req.body.profileImage) {
      if (user.profileImage?.public_id) {
        await removeImageFile(user.profileImage.public_id);
      }
      user.profileImage = req.body.profileImage;
    }

    const updatedUser = await user.save();
    const safeUser = await User.findById(updatedUser._id).select("-password");
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Change password (verifies current password first)
// @route PUT /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "Please fill all password fields" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add a new address
// @route POST /api/users/address
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let resolvedName = req.body.fullName?.trim() || user.name;
    let resolvedPhone = req.body.phone?.trim() || user.phone;
    let resolvedAddress = req.body.address?.trim();
    if (!resolvedAddress && (req.body.houseNo || req.body.street)) {
      resolvedAddress = [req.body.houseNo, req.body.street]
        .filter(Boolean)
        .map((s) => s.trim())
        .join(", ");
    }
    const city = req.body.city?.trim();
    const state = req.body.state?.trim();
    const pincode = req.body.pincode?.trim();
    const country = req.body.country?.trim() || "India";
    const isDefault = req.body.isDefault;

    if (!resolvedName || !resolvedPhone || !resolvedAddress || !city || !state || !pincode) {
      return res.status(400).json({
        message: "Please fill all required address fields (Name, Phone, Address, City, State, Pincode)",
      });
    }

    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      fullName: resolvedName,
      phone: resolvedPhone,
      address: resolvedAddress,
      city,
      state,
      pincode,
      country,
      isDefault: Boolean(isDefault || user.addresses.length === 0),
    });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update an existing address
// @route PUT /api/users/address/:addressId
export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    let resolvedAddress = req.body.address?.trim();
    if (!resolvedAddress && (req.body.houseNo || req.body.street)) {
      resolvedAddress = [req.body.houseNo, req.body.street]
        .filter(Boolean)
        .map((s) => s.trim())
        .join(", ");
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    address.fullName = req.body.fullName?.trim() || address.fullName;
    address.phone = req.body.phone?.trim() || address.phone;
    address.address = resolvedAddress || address.address;
    address.city = req.body.city?.trim() || address.city;
    address.state = req.body.state?.trim() || address.state;
    address.pincode = req.body.pincode?.trim() || address.pincode;
    address.country = req.body.country?.trim() || address.country;
    address.isDefault = req.body.isDefault ?? address.isDefault;

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Set an address as default
// @route PUT /api/users/address/:addressId/default
export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    user.addresses.forEach((addr) => (addr.isDefault = false));
    address.isDefault = true;

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete an address
// @route DELETE /api/users/address/:addressId
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );

    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all users (Admin only)
// @route GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};