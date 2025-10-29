import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../../generated/prisma/client.js';

interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Authenticate user using JWT
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) :void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: 'Access token required' });
    return 
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res
        .status(403)
        .json({ success: false, message: 'Invalid or expired token' });
      return 
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

/**
 * Authorize user based on role(s)
 * Usage example:
 * router.get('/admin', authenticateToken, authorize([Role.ADMIN]), handler);
 */
export const authorize =
  (roles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: 'Invalid or expired token' });
      }

      const user = decoded as JwtPayload;
      req.user = user;

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: only [${roles.join(', ')}] can access this route`,
        });
      }

      next();
    });
  };

export type { AuthRequest };
