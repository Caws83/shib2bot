/**
 * Main entry point for the Veo3 Telegram Bot
 * Initializes environment, HTTP server, and Telegram bot
 */

import { loadEnvConfig } from './config/env';
import { logger } from './utils/logger';
import { startHttpServer } from './server/httpServer';
import { initializeTelegramBot } from './bot/telegramBot';
import { createVideoProvider } from './video';

/**
 * Main application startup function
 */
const main = async (): Promise<void> => {
  try {
    // Load and validate environment configuration
    const config = loadEnvConfig();

    // Initialize video provider
    const videoProvider = createVideoProvider(config.videoProvider, config.videoApiKey);

    // Start HTTP server
    startHttpServer(config.port);

    // Initialize and start Telegram bot
    initializeTelegramBot(config.telegramBotToken, videoProvider);

    // Log startup information
    logger.info('Veo3 Telegram Bot started successfully', {
      port: config.port,
      videoProvider: config.videoProvider,
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

