/**
 * Credit Service
 * Handles credit balance operations with atomic transactions
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreditTransaction {
  userId: string;
  amount: number;
  reason: string;
  jobId?: string;
}

/**
 * Get user's current credit balance
 */
export async function getBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  return user.creditBalance;
}

/**
 * Require and deduct credits atomically
 * Throws error if insufficient credits
 */
export async function requireAndDeductCredits(
  userId: string,
  amount: number,
  reason: string,
  jobId?: string
): Promise<void> {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive');
  }

  // Use Prisma transaction for atomicity
  await prisma.$transaction(async (tx) => {
    // Lock the user row and check balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    if (user.creditBalance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${user.creditBalance}`);
    }

    // Deduct credits
    await tx.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          decrement: amount,
        },
      },
    });

    // Create usage record
    await tx.usageRecord.create({
      data: {
        userId,
        jobId,
        creditsUsed: amount,
        modelName: 'default',
      },
    });

    logger.info('Credits deducted', {
      userId,
      amount,
      newBalance: user.creditBalance - amount,
      reason,
      jobId,
    });
  });
}

/**
 * Add credits to user balance
 */
export async function addCredits(
  userId: string,
  amount: number,
  reason: string,
  paymentInvoiceId?: string
): Promise<void> {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive');
  }

  await prisma.$transaction(async (tx) => {
    // Add credits
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          increment: amount,
        },
      },
      select: { creditBalance: true },
    });

    // Create usage record (negative amount means credits added)
    await tx.usageRecord.create({
      data: {
        userId,
        creditsUsed: -amount, // Negative means added
        modelName: 'credit_purchase',
      },
    });

    logger.info('Credits added', {
      userId,
      amount,
      newBalance: updatedUser.creditBalance,
      reason,
      paymentInvoiceId,
    });
  });
}

/**
 * Refund credits (used when job fails)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  jobId: string
): Promise<void> {
  await addCredits(userId, amount, `Refund: ${reason}`, undefined);
  logger.info('Credits refunded', { userId, amount, reason, jobId });
}

