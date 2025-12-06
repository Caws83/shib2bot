/**
 * Telegram bot command handlers (database-backed)
 */

import { Context } from 'telegraf';
import { PrismaClient, ChatType, JobStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { parsePrompt } from '../utils/promptParser';
import { logger } from '../utils/logger';
import { getBalance, requireAndDeductCredits, refundCredits } from '../services/creditService';
import { requestVideoGeneration } from '../services/videoEngine';
import axios from 'axios';

const prisma = new PrismaClient();
const DEFAULT_DURATION = 10;
const DEFAULT_ASPECT_RATIO = '16:9';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://yourdomain.com';
const COST_CREDITS = 10; // Cost per video generation

/**
 * Get or create user from Telegram context
 */
async function getOrCreateUser(ctx: Context) {
  if (!ctx.from) {
    throw new Error('No user in context');
  }

  const telegramId = ctx.from.id.toString();
  let user = await prisma.user.findUnique({
    where: { telegramId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        telegramUsername: ctx.from.username || null,
        role: 'USER',
        creditBalance: 0,
      },
    });
    logger.info('New user created', { userId: user.id, telegramId });
  } else if (ctx.from.username && ctx.from.username !== user.telegramUsername) {
    // Update username if changed
    user = await prisma.user.update({
      where: { id: user.id },
      data: { telegramUsername: ctx.from.username },
    });
  }

  return user;
}

/**
 * Get or create chat from Telegram context
 */
async function getOrCreateChat(ctx: Context, userId: string) {
  if (!ctx.chat) {
    return null;
  }

  const telegramChatId = ctx.chat.id.toString();
  let chat = await prisma.chat.findUnique({
    where: { telegramChatId },
  });

  if (!chat) {
    const chatType = ctx.chat.type === 'private' ? ChatType.PRIVATE :
                     ctx.chat.type === 'group' ? ChatType.GROUP :
                     ctx.chat.type === 'supergroup' ? ChatType.SUPERGROUP :
                     ChatType.PRIVATE;

    chat = await prisma.chat.create({
      data: {
        telegramChatId,
        type: chatType,
        title: 'title' in ctx.chat ? ctx.chat.title : null,
        ownerId: userId,
        isBanned: false,
        dailyLimit: 50,
      },
    });
    logger.info('New chat created', { chatId: chat.id, telegramChatId });
  }

  return chat;
}

/**
 * Handles the /start command
 */
export const handleStart = async (ctx: Context): Promise<void> => {
  try {
    const user = await getOrCreateUser(ctx);
    const balance = await getBalance(user.id);

    const welcomeMessage = `🐕 SHIB2BOT is here! 🚀

Rebuilding the ShibArmy ecosystem with stealth launch - fair for everyone! 💎

💰 Your Credits: ${balance}
🎬 Generate AI videos with /video command

Example: /video shiba inu flying through a neon city

Let's create something amazing! 🌟`;

    // Add button to open Mini App dashboard
    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📊 Open Dashboard',
              web_app: { url: `${FRONTEND_URL}/mini/user` },
            },
          ],
        ],
      },
    });

    logger.info('Start command handled', { userId: user.id, telegramId: user.telegramId });
  } catch (error) {
    logger.error('Error handling /start command', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
};

/**
 * Handles the /video command
 */
export const handleVideo = async (ctx: Context): Promise<void> => {
  try {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Please send a text message with the /video command.');
      return;
    }

    const user = await getOrCreateUser(ctx);
    const chat = await getOrCreateChat(ctx, user.id);

    // Check if chat is banned
    if (chat && chat.isBanned) {
      await ctx.reply('❌ This chat has been banned from using the bot.');
      return;
    }

    // Check daily limit
    if (chat) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayJobsCount = await prisma.job.count({
        where: {
          chatId: chat.id,
          createdAt: { gte: today },
        },
      });

      if (todayJobsCount >= chat.dailyLimit) {
        await ctx.reply(`❌ Daily limit reached (${chat.dailyLimit} videos per day). Try again tomorrow!`);
        return;
      }
    }

    // Check credits
    const balance = await getBalance(user.id);
    if (balance < COST_CREDITS) {
      await ctx.reply(
        `❌ Insufficient credits. You need ${COST_CREDITS} credits but only have ${balance}.\n\n` +
        `Use /buy to purchase more credits.`
      );
      return;
    }

    const messageText = 'text' in ctx.message ? ctx.message.text : '';
    const args = messageText.replace(/^\/video\s*/i, '').trim();

    if (!args || args.length === 0) {
      const usageMessage = `📹 Video Generation

Usage: /video <prompt> [duration] [aspect ratio]

Examples:
• /video cyberpunk shiba inu running through neon Tokyo
• /video sunset over mountains, 10 seconds, 16:9

Cost: ${COST_CREDITS} credits per video`;
      await ctx.reply(usageMessage);
      return;
    }

    if (args.length > 500) {
      await ctx.reply('❌ Prompt is too long. Please keep it under 500 characters.');
      return;
    }

    const parsed = parsePrompt(args);
    const prompt = parsed.prompt.trim();

    if (!prompt || prompt.length < 3) {
      await ctx.reply('❌ Please provide a valid prompt (at least 3 characters).');
      return;
    }

    const durationSeconds = parsed.durationSeconds || DEFAULT_DURATION;
    const aspectRatio = parsed.aspectRatio || DEFAULT_ASPECT_RATIO;

    // Deduct credits
    let job;
    try {
      await requireAndDeductCredits(user.id, COST_CREDITS, 'Video generation');

      // Create job
      job = await prisma.job.create({
        data: {
          userId: user.id,
          chatId: chat?.id,
          prompt,
          status: JobStatus.QUEUED,
          costCredits: COST_CREDITS,
          modelName: 'default',
          durationSeconds,
        },
      });

      // Update usage record with jobId
      await prisma.usageRecord.updateMany({
        where: {
          userId: user.id,
          jobId: null,
          creditsUsed: COST_CREDITS,
        },
        data: {
          jobId: job.id,
        },
      });
    } catch (error: any) {
      if (error.message.includes('Insufficient credits')) {
        await ctx.reply(`❌ Insufficient credits. You need ${COST_CREDITS} credits.`);
        return;
      }
      throw error;
    }

    const statusMessage = await ctx.reply('⏳ Generating your video... This may take a moment.');

    // Trigger video generation asynchronously
    requestVideoGeneration(job.id, prompt, {
      modelName: 'default',
      durationSeconds,
    }).catch(async (error) => {
      logger.error('Failed to start video generation', { jobId: job.id, error });
      // Refund credits on failure
      try {
        await refundCredits(user.id, COST_CREDITS, 'Video generation failed', job.id);
      } catch (refundError) {
        logger.error('Failed to refund credits', { jobId: job.id, error: refundError });
      }
    });

    // Poll for job completion
    pollJobStatus(ctx, job.id, statusMessage.message_id);
  } catch (error) {
    logger.error('Error handling /video command', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
};

/**
 * Poll job status and send video when complete
 */
async function pollJobStatus(ctx: Context, jobId: string, statusMessageId: number) {
  const maxAttempts = 60; // 5 minutes
  let attempts = 0;

  const pollInterval = setInterval(async () => {
    attempts++;

    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        clearInterval(pollInterval);
        return;
      }

      if (job.status === JobStatus.COMPLETED && job.videoUrl) {
        clearInterval(pollInterval);

        // Delete status message
        try {
          await ctx.telegram.deleteMessage(ctx.chat!.id, statusMessageId);
        } catch (e) {
          // Ignore
        }

        // Send video
        const caption = `🎬 ${job.prompt}\n\n⏱ Duration: ${job.durationSeconds || DEFAULT_DURATION}s`;
        await ctx.telegram.sendVideo(ctx.chat!.id, job.videoUrl, { caption });

        logger.info('Video sent to user', { jobId, userId: job.userId });
      } else if (job.status === JobStatus.FAILED) {
        clearInterval(pollInterval);

        // Delete status message
        try {
          await ctx.telegram.deleteMessage(ctx.chat!.id, statusMessageId);
        } catch (e) {
          // Ignore
        }

        await ctx.reply(
          `❌ Video generation failed: ${job.errorMessage || 'Unknown error'}\n\n` +
          `Your credits have been refunded.`
        );
      }
    } catch (error) {
      logger.error('Error polling job status', { jobId, error });
    }

    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
    }
  }, 5000); // Poll every 5 seconds
}

/**
 * Handles the /credits command
 */
export const handleCredits = async (ctx: Context): Promise<void> => {
  try {
    const user = await getOrCreateUser(ctx);
    const balance = await getBalance(user.id);

    await ctx.reply(`💰 Your Credit Balance: ${balance}\n\nUse /buy to purchase more credits.`);
  } catch (error) {
    logger.error('Error handling /credits command', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
};

/**
 * Handles the /buy command
 */
export const handleBuy = async (ctx: Context): Promise<void> => {
  try {
    const user = await getOrCreateUser(ctx);

    // Create payment invoice via API
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/payments/create-invoice`,
        { packageId: 'starter' },
        {
          headers: {
            Authorization: `Bearer ${generateUserJWT(user.id)}`,
          },
        }
      );

      const { paymentUrl, amountFiat, creditsGranted } = response.data;

      await ctx.reply(
        `💳 Purchase Credits\n\n` +
        `Package: Starter\n` +
        `Amount: $${amountFiat}\n` +
        `Credits: ${creditsGranted}\n\n` +
        `Click the button below to pay:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '💳 Pay Now', url: paymentUrl }],
            ],
          },
        }
      );
    } catch (error: any) {
      logger.error('Error creating payment invoice', { error: error.message });
      await ctx.reply('Sorry, couldn\'t create payment invoice. Please try again later.');
    }
  } catch (error) {
    logger.error('Error handling /buy command', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
};

/**
 * Handles the /dashboard command
 */
export const handleDashboard = async (ctx: Context): Promise<void> => {
  try {
    await ctx.reply('📊 Opening your dashboard...', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📊 Open Dashboard',
              web_app: { url: `${FRONTEND_URL}/mini/user` },
            },
          ],
        ],
      },
    });
  } catch (error) {
    logger.error('Error handling /dashboard command', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
};

/**
 * Handles the /adminpanel command (admins only)
 */
export const handleAdminPanel = async (ctx: Context): Promise<void> => {
  try {
    const user = await getOrCreateUser(ctx);

    if (user.role !== 'ADMIN') {
      await ctx.reply('❌ Admin access required.');
      return;
    }

    await ctx.reply('🔧 Opening admin panel...', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔧 Open Admin Panel',
              web_app: { url: `${FRONTEND_URL}/mini/admin` },
            },
          ],
        ],
      },
    });
  } catch (error) {
    logger.error('Error handling /adminpanel command', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
};

/**
 * Generate JWT for user (helper function)
 */
function generateUserJWT(userId: string): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
}

/**
 * Handles generic text messages (not commands)
 */
export const handleText = async (ctx: Context): Promise<void> => {
  try {
    if (!ctx.message || !('text' in ctx.message)) {
      return;
    }

    const messageText = 'text' in ctx.message ? ctx.message.text : '';
    
    if (messageText.startsWith('/')) {
      await ctx.reply('Unknown command. Send /start to see available commands.');
      return;
    }

    await ctx.reply(
      '💡 To generate a video, use the /video command.\n\n' +
      'Example: /video ' + messageText.substring(0, 50) + 
      (messageText.length > 50 ? '...' : '') +
      '\n\nSend /start for more information.'
    );
  } catch (error) {
    logger.error('Error handling text message', error);
  }
};

