/**
 * Telegram bot initialization and setup
 */

import { Telegraf } from 'telegraf';
import { IVideoProvider } from '../video/IVideoProvider';
import { handleStart, handleVideo, handleText } from './telegramHandlers';
import { logger } from '../utils/logger';

/**
 * Initializes and starts the Telegram bot
 * @param botToken - Telegram bot token from BotFather
 * @param videoProvider - Video provider instance to use for generation
 */
export const initializeTelegramBot = (botToken: string, videoProvider: IVideoProvider): Telegraf => {
  const bot = new Telegraf(botToken);

  // Register command handlers
  bot.command('start', async (ctx) => {
    await handleStart(ctx);
  });

  bot.command('video', async (ctx) => {
    await handleVideo(ctx, videoProvider);
  });

  // Handle text messages (non-commands)
  bot.on('text', async (ctx) => {
    await handleText(ctx);
  });

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
    
    // Provide helpful error messages
    if (error.response?.error_code === 404 || error.response?.description === 'Not Found') {
      logger.error(
        '\n❌ INVALID TELEGRAM BOT TOKEN!\n' +
        'The token in your .env file is incorrect or invalid.\n' +
        'Please:\n' +
        '1. Open Telegram and message @BotFather\n' +
        '2. Send /mybots to see your bots\n' +
        '3. Select your bot and click "API Token"\n' +
        '4. Copy the token and update your .env file\n' +
        '5. Make sure there are no extra spaces or quotes around the token\n'
      );
    } else if (error.response?.error_code === 401) {
      logger.error(
        '\n❌ UNAUTHORIZED - Invalid bot token!\n' +
        'The token is malformed or has been revoked.\n' +
        'Get a new token from @BotFather on Telegram.\n'
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

