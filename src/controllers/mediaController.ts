import { Request, Response } from 'express';
import { MediaService } from '../services/mediaService';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';

export class MediaController {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.admin) {
        res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          status: 'error',
          message: 'No file uploaded',
        });
        return;
      }

      const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
      const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

      const fileUrl = `${BASE_URL}/${UPLOAD_DIR}/${req.file.filename}`;

      const media = await this.mediaService.createMedia({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        uploadedBy: req.admin.adminId,
      });

      res.status(201).json({
        status: 'success',
        data: { media },
      });
    } catch (error) {
      throw error;
    }
  };

  getMediaList = async (req: Request, res: Response): Promise<void> => {
    try {
      const { uploadedBy, page = '1', limit = '20' } = req.query;

      const result = await this.mediaService.getMediaList({
        uploadedBy: uploadedBy as string | undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.status(200).json({
        status: 'success',
        data: {
          media: result.media,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: result.total,
            totalPages: Math.ceil(result.total / parseInt(limit as string)),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  };

  getMediaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const media = await this.mediaService.getMediaById(id);

      res.status(200).json({
        status: 'success',
        data: { media },
      });
    } catch (error) {
      throw error;
    }
  };

  deleteMedia = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.admin) {
        res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
        return;
      }

      const { id } = req.params;
      const media = await this.mediaService.getMediaById(id);

      // Delete file from filesystem
      const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
      const filePath = path.join(UPLOAD_DIR, media.fileName);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        // File might not exist, continue with database deletion
        console.warn('File not found:', filePath);
      }

      await this.mediaService.deleteMedia(id);

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  };
}

