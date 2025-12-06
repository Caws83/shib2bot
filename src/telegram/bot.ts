/**
 * Telegram bot initialization (database-backed)
 */

import { Telegraf } from 'telegraf';
import { logger } from '../utils/logger';
import {
  handleStart,
  handleVideo,
  handleCredits,
  handleBuy,
  handleDashboard,
  handleAdminPanel,
  handleText,
} from './handlers';

/**
 * Initializes and starts the Telegram bot
 */
export const initializeTelegramBot = (botToken: string): Telegraf => {
  const bot = new Telegraf(botToken);

  // Register command handlers
  bot.command('start', handleStart);
  bot.command('video', handleVideo);
  bot.command('credits', handleCredits);
  bot.command('buy', handleBuy);
  bot.command('dashboard', handleDashboard);
  bot.command('adminpanel', handleAdminPanel);

  // Handle text messages (non-commands)
  bot.on('text', handleText);

  // Error handling
  bot.catch((err, ctx) => {
    logger.error('Telegram bot error', {
      error: err,
      update: ctx.update,
    });
    
    ctx.reply('Sorry, an error occurred. Please try again later.').catch((replyError) => {
      logger.error('Failed to send error message', replyError);
    });
  });

  // Start polling
  bot.launch().then(() => {
    logger.info('Telegram bot started and polling for updates');
  }).catch((error: any) => {
    logger.error('Failed to start Telegram bot', error);
    
    if (error.response?.error_code === 404 || error.response?.description === 'Not Found') {
      logger.error(
        '\n❌ INVALID TELEGRAM BOT TOKEN!\n' +
        'The token in your .env file is incorrect or invalid.\n'
      );
    } else if (error.response?.error_code === 401) {
      logger.error(
        '\n❌ UNAUTHORIZED - Invalid bot token!\n' +
        'The token is malformed or has been revoked.\n'
      );
    }
    
    throw error;
  });

  // Enable graceful stop
  process.once('SIGINT', () => {
    logger.info('SIGINT received, stopping bot gracefully');
    bot.stop('SIGINT');
  });

  process.once('SIGTERM', () => {
    logger.info('SIGTERM received, stopping bot gracefully');
    bot.stop('SIGTERM');
  });

  return bot;
};

