import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          status: 'error',
          message: 'Email and password are required',
        });
        return;
      }

      const result = await this.authService.login(email, password);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      throw error;
    }
  };

  getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.admin) {
        res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
        return;
      }

      const admin = await this.authService.getAdminById(req.admin.adminId);

      res.status(200).json({
        status: 'success',
        data: { admin },
      });
    } catch (error) {
      throw error;
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      // Refresh token 로직은 추후 구현 (현재는 access token 재발급)
      res.status(200).json({
        status: 'success',
        message: 'Token refresh endpoint - to be implemented',
      });
    } catch (error) {
      throw error;
    }
  };
}

