import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail, { getBrandedEmailTemplate } from "../utils/sendEmail.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// @desc Register new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and Confirm Password do not match" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ $or: [{ email: normalizedEmail }, { phone: phone.trim() }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email or phone" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      verificationToken: hashToken(verifyToken),
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    console.log(`\n🔗 [EMAIL VERIFICATION LINK]: ${verifyUrl}\n`);

    // Registration still succeeds even if the email fails to send
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your FashionHub account",
        html: getBrandedEmailTemplate({
          title: "Welcome to FashionHub",
          bodyContent: `<p>Hi ${user.name},</p><p>Thank you for creating an account with FashionHub! Please click the button below to verify your email address and activate your account features.</p><p>This link will expire in 24 hours.</p>`,
          buttonText: "Verify Email Address",
          buttonUrl: verifyUrl,
        }),
      });
    } catch (emailError) {
      console.error("Verification email failed to send:", emailError.message);
    }

    const token = generateToken(res, user._id);

    res.status(201).json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      verifyUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(res, user._id);

    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Logout user
// @route POST /api/auth/logout
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
};

// @desc Verify email using token from verification link
// @route GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or has expired" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Resend email verification link
// @route POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Your email is already verified" });

    const verifyToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = hashToken(verifyToken);
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    console.log(`\n🔗 [RESEND VERIFICATION LINK]: ${verifyUrl}\n`);
    await sendEmail({
      to: user.email,
      subject: "Verify your FashionHub account",
      html: getBrandedEmailTemplate({
        title: "Verify Your Email",
        bodyContent: `<p>Hi ${user.name},</p><p>Please click the button below to verify your email address and keep your FashionHub account secure.</p><p>This link will expire in 24 hours.</p>`,
        buttonText: "Verify Email",
        buttonUrl: verifyUrl,
      }),
    });

    res.json({
      message: "Verification email sent",
      verifyUrl,
      emailSent: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Request a password reset link
// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please provide your email address" });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // In development / testing, give clear feedback if user doesn't exist
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address. Please check your email or create an account.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    console.log(`\n🔑 [PASSWORD RESET LINK]: ${resetUrl}\n`);

    let emailSent = false;
    let emailErrorMsg = "";
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your FashionHub password",
        html: getBrandedEmailTemplate({
          title: "Password Reset Request",
          bodyContent: `<p>Hi ${user.name},</p><p>You recently requested to reset your password for your FashionHub account. Click the button below to choose a new password.</p><p>This link will expire in 1 hour. If you didn't make this request, you can safely ignore this email.</p>`,
          buttonText: "Reset Password",
          buttonUrl: resetUrl,
        }),
      });
      emailSent = true;
    } catch (emailError) {
      emailErrorMsg = emailError.message;
      console.error("Password reset email delivery note:", emailError.message);
    }

    res.json({
      message: emailSent
        ? "A password reset link has been dispatched to your email."
        : "A password reset link has been generated.",
      resetUrl,
      emailSent,
      emailError: emailErrorMsg || undefined,
      devMode: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Reset password using token from reset link
// @route PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Please provide and confirm your new password" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const hashedToken = hashToken(req.params.token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Reset link is invalid or has expired" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};