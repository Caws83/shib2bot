/**
 * Express HTTP server for health checks and future webhooks
 */

import express, { Express, Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * Creates and configures the Express application
 */
export const createHttpServer = (): Express => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      service: 'Veo3 Telegram Bot',
      status: 'running',
      endpoints: {
        health: '/health',
      },
    });
  });

  // TODO: Add webhook endpoints for:
  // - Video provider callbacks (when providers support webhooks)
  // - Twitter/X webhooks (when implementing Twitter integration)
  // Example:
  // app.post('/webhooks/video-provider', handleVideoProviderWebhook);
  // app.post('/webhooks/twitter', handleTwitterWebhook);

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

