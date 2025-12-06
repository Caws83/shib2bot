/**
 * Payment API endpoints
 */

import { Router, Response } from 'express';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { authenticateApiKey, authenticateJWT, AuthRequest } from '../../middleware/auth';
import { addCredits } from '../../services/creditService';
import { logger } from '../../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Credit packages (can be moved to config)
const CREDIT_PACKAGES = [
  { id: 'starter', amountFiat: 10, credits: 100 },
  { id: 'pro', amountFiat: 25, credits: 300 },
  { id: 'enterprise', amountFiat: 50, credits: 700 },
];

/**
 * POST /api/v1/payments/create-invoice
 * Create a crypto payment invoice
 */
router.post('/create-invoice', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { packageId, amountFiat } = req.body;

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
      // Simple conversion: $1 = 10 credits
      creditsToGrant = Math.floor(fiatAmount * 10);
    } else {
      res.status(400).json({ error: 'Either packageId or amountFiat required' });
      return;
    }

    // For now, we'll mock the crypto provider integration
    // In production, integrate with NOWPayments or Coinbase Commerce
    const externalInvoiceId = `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paymentUrl = `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/pay/${externalInvoiceId}`;

    // Create invoice in database
    const invoice = await prisma.paymentInvoice.create({
      data: {
        userId: req.user.id,
        amountFiat: fiatAmount,
        amountCrypto: fiatAmount, // Mock - in production, convert to crypto
        cryptoCurrency: 'USDT', // Default
        externalInvoiceId,
        status: PaymentStatus.PENDING,
        creditsGranted: creditsToGrant,
      },
    });

    logger.info('Payment invoice created', {
      invoiceId: invoice.id,
      userId: req.user.id,
      amount: fiatAmount,
      credits: creditsToGrant,
    });

    res.json({
      invoiceId: invoice.id,
      paymentUrl,
      amountFiat: fiatAmount,
      creditsGranted: creditsToGrant,
      status: 'PENDING',
    });
  } catch (error: any) {
    logger.error('Error creating payment invoice', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/v1/payments/webhook
 * Webhook endpoint for crypto payment providers
 * This should verify the signature and process confirmed payments
 */
router.post('/webhook', async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Verify webhook signature from crypto provider
    // For NOWPayments: verify using IPN secret
    // For Coinbase Commerce: verify using webhook secret

    const { invoiceId, status, txHash } = req.body;

    if (!invoiceId) {
      res.status(400).json({ error: 'invoiceId required' });
      return;
    }

    const invoice = await prisma.paymentInvoice.findUnique({
      where: { externalInvoiceId: invoiceId },
      include: { user: true },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    // Only process if status changed to CONFIRMED
    if (status === 'CONFIRMED' && invoice.status !== PaymentStatus.CONFIRMED) {
      // Update invoice
      await prisma.paymentInvoice.update({
        where: { id: invoice.id },
        data: {
          status: PaymentStatus.CONFIRMED,
          txHash: txHash || undefined,
        },
      });

      // Add credits to user
      await addCredits(
        invoice.userId,
        invoice.creditsGranted,
        `Payment confirmed: Invoice ${invoice.id}`,
        invoice.id
      );

      logger.info('Payment confirmed and credits added', {
        invoiceId: invoice.id,
        userId: invoice.userId,
        credits: invoice.creditsGranted,
      });
    } else if (status === 'CANCELLED' || status === 'EXPIRED') {
      await prisma.paymentInvoice.update({
        where: { id: invoice.id },
        data: {
          status: status === 'CANCELLED' ? PaymentStatus.CANCELLED : PaymentStatus.EXPIRED,
        },
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error processing payment webhook', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

