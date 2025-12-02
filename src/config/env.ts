/**
 * Environment configuration loader
 */

import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Load environment variables from .env file
dotenv.config();

export interface EnvConfig {
  telegramBotToken: string;
  videoProvider: string;
  videoApiKey: string;
  port: number;
}

/**
 * Validates and loads environment variables
 * Throws an error if required variables are missing
 */
export const loadEnvConfig = (): EnvConfig => {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  
  // Default to dummy provider (free, no API keys needed)
  // Railway: Set VIDEO_PROVIDER=dummy in Railway environment variables
  // This ensures the bot works even without paid API keys
  let videoProvider = (process.env.VIDEO_PROVIDER || 'dummy').toLowerCase().trim();
  
  // If VIDEO_PROVIDER is not set or empty, use dummy
  if (!videoProvider || videoProvider === '') {
    videoProvider = 'dummy';
    logger.info('No VIDEO_PROVIDER set, defaulting to dummy (free)');
  }
  
  const videoApiKey = process.env.VIDEO_API_KEY || '';
  const port = parseInt(process.env.PORT || '3000', 10);
  
  // Log what provider we're using for debugging
  logger.info('Loading environment config', {
    videoProvider,
    hasApiKey: !!videoApiKey,
    port,
    forceDummy,
    nodeEnv: process.env.NODE_ENV,
  });

  if (!telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required in environment variables');
  }

  // Validate token format (should be numbers:letters, e.g., "123456789:ABCdef...")
  if (!/^\d+:[A-Za-z0-9_-]+$/.test(telegramBotToken)) {
    throw new Error(
      'Invalid TELEGRAM_BOT_TOKEN format. Expected format: "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"\n' +
      'Please check your .env file and make sure the token is correct.\n' +
      'Get a new token from @BotFather on Telegram if needed.'
    );
  }

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}. Must be between 1 and 65535`);
  }

  const config: EnvConfig = {
    telegramBotToken,
    videoProvider: videoProvider.toLowerCase(),
    videoApiKey,
    port,
  };

  // Force dummy if it's not a recognized provider (safety check)
  const validProviders = ['dummy', 'demo', 'falai', 'fal', 'veo3', 'pika', 'custom'];
  if (!validProviders.includes(config.videoProvider)) {
    logger.warn(`Invalid provider "${config.videoProvider}", forcing to "dummy"`);
    config.videoProvider = 'dummy';
  }

  logger.info('✓ Environment configuration loaded', {
    videoProvider: config.videoProvider,
    port: config.port,
    willUseDummy: config.videoProvider === 'dummy' || config.videoProvider === 'demo',
  });

  return config;
};

