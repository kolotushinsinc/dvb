import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    isAdmin?: boolean;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        isAdmin?: boolean;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('isAdmin isActive');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found'
      });
    }

    req.user = {
      userId: decoded.userId,
      isAdmin: user.isAdmin
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin rights required.'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await User.findById(decoded.userId).select('isAdmin isActive');

    if (user && user.isActive) {
      req.user = {
        userId: decoded.userId,
        isAdmin: user.isAdmin
      };
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};