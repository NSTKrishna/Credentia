import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): any => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as {
      userId: string;
      email: string;
      role: Role;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Access token is missing or invalid' });
  }
};

export const requireRole = (role: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
