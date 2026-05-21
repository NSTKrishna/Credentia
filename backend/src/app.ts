import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRouter from './routes/auth.routes';
import candidateRouter from './routes/candidate.routes';
import mockRouter from './routes/mock.routes';
import verificationRouter from './routes/verification.routes';
import statsRouter from './routes/stats.routes';
import reportRouter from './routes/report.routes';

import { verifyToken } from './middleware/auth.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { globalErrorHandler } from './middleware/errorHandler.middleware';
import { authLimiter, apiLimiter, verificationLimiter } from './middleware/rateLimit.middleware';

dotenv.config();

const app = express();

// ─── Security: Request ID (first — so all subsequent middleware/logs can reference it) ──
app.use(requestIdMiddleware);

// ─── Security: Helmet — hardened HTTP headers ─────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
  })
);

// ─── Security: CORS — restrict to FRONTEND_URL only ─────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000']; // Dev fallback

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin "${origin}" not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' })); // Limit body size to prevent DoS

// ─── Rate limiting: broad API limit (must come before route registration) ────
app.use('/api/', apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);                              // Stricter limit on auth
app.use('/api/candidates', verifyToken, candidateRouter);
app.use('/api/verifications', verifyToken, verificationLimiter, verificationRouter); // Hourly verification cap
app.use('/api/stats', verifyToken, statsRouter);
app.use('/api/reports', verifyToken, reportRouter);
app.use('/mock-api', mockRouter);                                            // Internal only

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler (MUST be LAST) ──────────────────────────────────────
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT} | ENV: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;