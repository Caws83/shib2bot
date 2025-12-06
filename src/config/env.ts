/**
 * Environment configuration loader
 */

import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Load environment variables from .env file
dotenv.config();

export interface EnvConfig {
  telegramBotToken: string;
  port: number;
}

/**
 * Validates and loads environment variables
 * Throws an error if required variables are missing
 */
export const loadEnvConfig = (): EnvConfig => {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const port = parseInt(process.env.PORT || '3000', 10);
  
  // Log environment config
  logger.info('Loading environment config', {
    port,
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasVideoEngineUrl: !!process.env.VIDEO_ENGINE_BASE_URL,
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

  // Validate required environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Railway provides this automatically when you add PostgreSQL.');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Generate a random secret string.');
  }

  // Video engine is optional (will use mock in development)
  if (!process.env.VIDEO_ENGINE_BASE_URL) {
    logger.warn('VIDEO_ENGINE_BASE_URL not set - will use mock video engine');
  }

  const config: EnvConfig = {
    telegramBotToken,
    port,
  };

  logger.info('✓ Environment configuration loaded', {
    port: config.port,
  });

  return config;
};

