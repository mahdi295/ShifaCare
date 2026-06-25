import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import ErrorResponse from '../utils/errorResponse.js';

// ── Cloudinary config (called once at startup via index.js) ───────────────────
export const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// ── Multer — store file in memory so we can stream to Cloudinary ──────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Only image files are allowed', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
});

// ── Helper: upload a buffer to Cloudinary ────────────────────────────────────
export const uploadToCloudinary = (buffer, folder = 'shifacare/avatars') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ── Helper: delete old avatar from Cloudinary ────────────────────────────────
export const deleteFromCloudinary = async (avatarUrl) => {
  try {
    if (!avatarUrl || avatarUrl === 'no-photo.jpg') return;
    // Extract public_id from URL: .../shifacare/avatars/abc123.jpg → shifacare/avatars/abc123
    const parts = avatarUrl.split('/');
    const filenameWithExt = parts[parts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folder = parts.slice(parts.indexOf('shifacare')).slice(0, -1).join('/');
    const publicId = `${folder}/${filename}`;
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Non-fatal — old image deletion failure should not break the response
  }
};
