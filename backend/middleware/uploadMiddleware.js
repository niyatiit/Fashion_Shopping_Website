import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Hybrid storage engine: tries Cloudinary first, gracefully falls back to local uploads if Cloudinary returns 403 or fails
const hybridStorage = {
  _handleFile: (req, file, cb) => {
    const chunks = [];
    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("end", async () => {
      const buffer = Buffer.concat(chunks);

      // 1. Attempt Cloudinary upload
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "fashion-shopping-website",
              resource_type: "image",
              transformation: [{ width: 1000, height: 1000, crop: "limit" }],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        return cb(null, {
          path: uploadResult.secure_url,
          filename: uploadResult.public_id,
          size: buffer.length,
        });
      } catch (cloudErr) {
        console.warn(`⚠️ Cloudinary upload note: ${cloudErr.message}. Saving image locally.`);

        // 2. Fallback: save to backend/uploads
        const ext = path.extname(file.originalname) || ".jpg";
        const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
        const filename = `${Date.now()}_${cleanName}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFile(filePath, buffer, (writeErr) => {
          if (writeErr) return cb(writeErr);

          const host = req.get("host") || "localhost:3000";
          const protocol = req.protocol || "http";
          const publicUrl = `${protocol}://${host}/uploads/${filename}`;

          cb(null, {
            path: publicUrl,
            filename: `local_${filename}`,
            size: buffer.length,
          });
        });
      }
    });

    file.stream.on("error", (err) => cb(err));
  },

  _removeFile: (req, file, cb) => {
    if (file.filename && file.filename.startsWith("local_")) {
      const localFile = file.filename.replace("local_", "");
      const fullPath = path.join(uploadsDir, localFile);
      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, () => cb());
      } else {
        cb();
      }
    } else if (file.filename) {
      cloudinary.uploader.destroy(file.filename, () => cb());
    } else {
      cb();
    }
  },
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: hybridStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter,
});

export default upload;