import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Attaches a unique UUID to every incoming request for distributed tracing.
 * Reads x-request-id from the incoming header if present (e.g. from a load balancer),
 * otherwise generates a fresh UUID. Always echoes the value back in the response header.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};
