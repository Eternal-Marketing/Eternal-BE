import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import { AppError } from './errorHandler';

// Ensure uploads directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Create uploads directory if it doesn't exist
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {
  // Directory might already exist, ignore error
});

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${randomUUID()}${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only images
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only image files are allowed') as AppError;
    error.statusCode = 400;
    error.status = 'error';
    cb(error);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Middleware to handle single file upload
export const uploadSingle = upload.single('file');

// Middleware to handle multiple file uploads
export const uploadMultiple = upload.array('files', 10);

