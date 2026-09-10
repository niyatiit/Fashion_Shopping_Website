import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";

// Default admin credentials — override via .env, or edit the fallbacks below.
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fashionhub.com";
const ADMIN_PHONE = process.env.ADMIN_PHONE || "9999999999";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log(`✅ Existing user "${ADMIN_EMAIL}" promoted to admin.`);
      } else {
        console.log(`ℹ️  Admin "${ADMIN_EMAIL}" already exists. Nothing to do.`);
      }
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Default admin created successfully:");
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("⚠️  Log in and change this password — this script prints it in plain text.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();