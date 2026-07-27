import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const hasCloudinary =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

let storage: multer.StorageEngine;

if (hasCloudinary) {
  try {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary.v2,
      params: {
        folder: 'lms_salary_slips',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        resource_type: 'auto',
      } as Record<string, unknown>,
    });
  } catch (err) {
    console.warn('⚠️ Cloudinary storage failed to initialize, falling back to local storage.');
    storage = createDiskStorage();
  }
} else {
  console.log('ℹ️  No Cloudinary credentials found. Using local disk storage for file uploads.');
  storage = createDiskStorage();
}

function createDiskStorage() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `slip-${uniqueSuffix}${ext}`);
    },
  });
}

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed.'));
    }
  },
});
