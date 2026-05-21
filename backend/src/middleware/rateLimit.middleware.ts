import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Auth limiter: 5 requests per 15 minutes per IP.
 * Applied to /api/auth/* to prevent brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  keyGenerator: (req: Request) => req.ip || 'unknown',
});

/**
 * General API limiter: 100 requests per minute per user (by IP as fallback).
 * Applied to all /api/* routes.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down and try again shortly.',
  },
  keyGenerator: (req: Request) => {
    // Prefer user ID for authenticated routes, fall back to IP
    const authReq = req as any;
    return authReq.user?.userId || req.ip || 'unknown';
  },
});

/**
 * Verification limiter: 10 requests per hour per user.
 * Applied to /api/verifications/* to prevent abuse of external API calls.
 */
export const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Verification limit reached. You can run up to 10 verifications per hour.',
  },
  keyGenerator: (req: Request) => {
    const authReq = req as any;
    return authReq.user?.userId || req.ip || 'unknown';
  },
});
