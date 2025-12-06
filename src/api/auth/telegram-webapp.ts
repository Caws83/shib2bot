/**
 * Telegram WebApp authentication endpoint
 */

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * Verify Telegram WebApp init data signature
 */
function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // Sort parameters and create data check string
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key from bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    logger.error('Error verifying Telegram WebApp data', { error });
    return false;
  }
}

/**
 * POST /auth/telegram-webapp
 * Authenticate Telegram WebApp and return JWT
 */
router.post('/telegram-webapp', async (req, res: Response) => {
  try {
    const { initData } = req.body;

    if (!initData || typeof initData !== 'string') {
      res.status(400).json({ error: 'initData required' });
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Verify Telegram signature
    if (!verifyTelegramWebAppData(initData, botToken)) {
      res.status(401).json({ error: 'Invalid Telegram WebApp data' });
      return;
    }

    // Parse init data
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    if (!userStr) {
      res.status(400).json({ error: 'User data not found in initData' });
      return;
    }

    const telegramUser = JSON.parse(userStr);
    const telegramId = telegramUser.id?.toString();

    if (!telegramId) {
      res.status(400).json({ error: 'Invalid user data' });
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          telegramUsername: telegramUser.username || null,
          role: 'USER',
          creditBalance: 0,
        },
      });
      logger.info('New user created from Telegram WebApp', { userId: user.id, telegramId });
    } else {
      // Update username if changed
      if (telegramUser.username && telegramUser.username !== user.telegramUsername) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { telegramUsername: telegramUser.username },
        });
      }
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        role: user.role,
        creditBalance: user.creditBalance,
      },
    });
  } catch (error: any) {
    logger.error('Error in Telegram WebApp auth', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

