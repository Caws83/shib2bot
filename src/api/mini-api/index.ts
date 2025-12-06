/**
 * Mini API endpoints for Telegram Mini App
 * All endpoints require JWT authentication
 */

import { Router, Response } from 'express';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { authenticateJWT, AuthRequest } from '../../middleware/auth';
import { getBalance } from '../../services/creditService';
import { logger } from '../../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /mini-api/me
 * Get current user profile
 */
router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        telegramId: true,
        telegramUsername: true,
        email: true,
        role: true,
        creditBalance: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    logger.error('Error in /mini-api/me', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /mini-api/me/jobs
 * Get user's recent jobs
 */
router.get('/me/jobs', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const jobs = await prisma.job.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        prompt: true,
        status: true,
        videoUrl: true,
        errorMessage: true,
        costCredits: true,
        modelName: true,
        durationSeconds: true,
        createdAt: true,
      },
    });

    const total = await prisma.job.count({
      where: { userId: req.user.id },
    });

    res.json({
      jobs,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    logger.error('Error in /mini-api/me/jobs', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /mini-api/payments/create-invoice
 * Create payment invoice (same as /api/v1/payments/create-invoice but uses JWT auth)
 */
router.post('/payments/create-invoice', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Reuse payment creation logic from v1
    const { packageId, amountFiat } = req.body;

    const CREDIT_PACKAGES = [
      { id: 'starter', amountFiat: 10, credits: 100 },
      { id: 'pro', amountFiat: 25, credits: 300 },
      { id: 'enterprise', amountFiat: 50, credits: 700 },
    ];

    let creditsToGrant = 0;
    let fiatAmount = 0;

    if (packageId) {
      const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
      if (!pkg) {
        res.status(400).json({ error: 'Invalid package ID' });
        return;
      }
      creditsToGrant = pkg.credits;
      fiatAmount = pkg.amountFiat;
    } else if (amountFiat) {
      fiatAmount = parseFloat(amountFiat);
      if (isNaN(fiatAmount) || fiatAmount <= 0) {
        res.status(400).json({ error: 'Invalid amount' });
        return;
      }
      creditsToGrant = Math.floor(fiatAmount * 10);
    } else {
      res.status(400).json({ error: 'Either packageId or amountFiat required' });
      return;
    }

    const externalInvoiceId = `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paymentUrl = `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/pay/${externalInvoiceId}`;

    const invoice = await prisma.paymentInvoice.create({
      data: {
        userId: req.user.id,
        amountFiat: fiatAmount,
        amountCrypto: fiatAmount,
        cryptoCurrency: 'USDT',
        externalInvoiceId,
        status: PaymentStatus.PENDING,
        creditsGranted: creditsToGrant,
      },
    });

    res.json({
      invoiceId: invoice.id,
      paymentUrl,
      amountFiat: fiatAmount,
      creditsGranted: creditsToGrant,
      status: 'PENDING',
    });
  } catch (error: any) {
    logger.error('Error in /mini-api/payments/create-invoice', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

