/**
 * Main entry point for the Veo3 Telegram Bot
 * Initializes environment, HTTP server, and Telegram bot
 */

import { loadEnvConfig } from './config/env';
import { logger } from './utils/logger';
import { startHttpServer } from './server/httpServer';
import { initializeTelegramBot } from './telegram/bot';

/**
 * Main application startup function
 */
const main = async (): Promise<void> => {
  try {
    // Load and validate environment configuration
    const config = loadEnvConfig();

    // Start HTTP server
    startHttpServer(config.port);

    // Initialize and start Telegram bot
    initializeTelegramBot(config.telegramBotToken);

    // Log startup information
    logger.info('SHIB2BOT started successfully', {
      port: config.port,
      botTokenSet: !!config.telegramBotToken,
    });

    logger.info('Bot is ready to receive commands');
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
};

// Start the application
main().catch((error) => {
  logger.error('Unhandled error in main', error);
  process.exit(1);
});

