/**
 * Express HTTP server for health checks and future webhooks
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { logger } from '../utils/logger';
import videoRouter from '../api/v1/video';
import meRouter from '../api/v1/me';
import paymentsRouter from '../api/v1/payments';
import telegramWebAppAuthRouter from '../api/auth/telegram-webapp';
import miniApiRouter from '../api/mini-api';

/**
 * Creates and configures the Express application
 */
export const createHttpServer = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      service: 'SHIB2BOT',
      status: 'running',
      version: '2.0.0',
      endpoints: {
        health: '/health',
        api: '/api/v1',
        mini: '/mini-api',
        auth: '/auth',
      },
    });
  });

  // API Routes
  app.use('/api/v1/video', videoRouter);
  app.use('/api/v1/me', meRouter);
  app.use('/api/v1/payments', paymentsRouter);

  // Auth routes
  app.use('/auth', telegramWebAppAuthRouter);

  // Mini API routes (for Telegram Mini App)
  app.use('/mini-api', miniApiRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
    logger.error('HTTP server error', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

/**
 * Starts the HTTP server on the specified port
 * @param port - Port number to listen on
 * @returns The Express app instance
 */
export const startHttpServer = (port: number): Express => {
  const app = createHttpServer();

  app.listen(port, () => {
    logger.info(`HTTP server started on port ${port}`);
  });

  return app;
};

