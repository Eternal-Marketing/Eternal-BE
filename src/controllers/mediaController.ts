import { Request, Response, NextFunction } from 'express';
import { MediaService } from '../services/mediaService';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';
import ENV from '../common/constants/ENV';
import HttpStatusCodes from '../common/constants/HttpStatusCodes';

/**
 * 파일 업로드
 * POST /api/media/upload
 */
export async function uploadFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.admin) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    if (!req.file) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'No file uploaded',
      });
      return;
    }

    const fileUrl = `${ENV.BaseUrl}/${ENV.UploadDir}/${req.file.filename}`;

    const mediaService = new MediaService();
    const media = await mediaService.createMedia({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      uploadedBy: req.admin.adminId,
    });

    res.status(HttpStatusCodes.CREATED).json({
      status: 'success',
      data: { media },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 미디어 목록 조회
 * GET /api/media
 */
export async function getMediaList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { uploadedBy, page = '1', limit = '20' } = req.query;

    const mediaService = new MediaService();
    const result = await mediaService.getMediaList({
      uploadedBy: uploadedBy as string | undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.status(HttpStatusCodes.OK).json({
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
    next(error);
  }
}

/**
 * 미디어 상세 조회
 * GET /api/media/:id
 */
export async function getMediaById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const mediaService = new MediaService();
    const media = await mediaService.getMediaById(id);

    res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: { media },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 미디어 삭제
 * DELETE /api/media/:id
 */
export async function deleteMedia(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.admin) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const mediaService = new MediaService();
    const media = await mediaService.getMediaById(id);

    // Delete file from filesystem
    const filePath = path.join(ENV.UploadDir, media.fileName);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, continue with database deletion
      console.warn('File not found:', filePath);
    }

    await mediaService.deleteMedia(id);

    res.status(HttpStatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}
