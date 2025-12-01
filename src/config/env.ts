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
  const videoProvider = process.env.VIDEO_PROVIDER || 'dummy';
  const videoApiKey = process.env.VIDEO_API_KEY || '';
  const port = parseInt(process.env.PORT || '3000', 10);

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

  logger.info('Environment configuration loaded', {
    videoProvider: config.videoProvider,
    port: config.port,
  });

  return config;
};

