import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler — MUST be the last middleware registered in app.ts.
 * In production: returns a generic message to avoid leaking internals.
 * In development: returns the full error message and stack trace.
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const requestId = (req as any).requestId || 'unknown';
  console.error(`[${requestId}] Unhandled error on ${req.method} ${req.path}:`, err.stack || err.message);

  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: 'Internal server error',
      requestId,
    });
  } else {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack,
      requestId,
    });
  }
};
