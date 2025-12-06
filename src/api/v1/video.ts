/**
 * Video generation API endpoints
 */

import { Router, Response } from 'express';
import { PrismaClient, JobStatus } from '@prisma/client';
import { authenticateApiKey, AuthRequest } from '../../middleware/auth';
import { requireAndDeductCredits } from '../../services/creditService';
import { requestVideoGeneration } from '../../services/videoEngine';
import { logger } from '../../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/v1/video/generate
 * Generate a video (requires API key)
 */
router.post('/generate', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, durationSeconds, modelName } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!req.apiKey || !req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.apiKey.userId;
    const costCredits = 10; // Default cost, can be made configurable

    // Check and deduct credits
    try {
      await requireAndDeductCredits(
        userId,
        costCredits,
        'Video generation',
        undefined // jobId will be set after job creation
      );
    } catch (error: any) {
      if (error.message.includes('Insufficient credits')) {
        res.status(402).json({ error: 'Insufficient credits', message: error.message });
        return;
      }
      throw error;
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        userId,
        apiKeyId: req.apiKey.id,
        prompt: prompt.trim(),
        status: JobStatus.QUEUED,
        costCredits,
        modelName: modelName || 'default',
        durationSeconds: durationSeconds || 10,
      },
    });

    // Update usage record with jobId
    await prisma.usageRecord.updateMany({
      where: {
        userId,
        jobId: null,
        creditsUsed: costCredits,
      },
      data: {
        jobId: job.id,
      },
    });

    // Trigger video generation asynchronously
    requestVideoGeneration(job.id, prompt.trim(), {
      modelName: modelName || 'default',
      durationSeconds: durationSeconds || 10,
    }).catch((error) => {
      logger.error('Failed to start video generation', { jobId: job.id, error });
    });

    res.json({
      jobId: job.id,
      status: 'QUEUED',
      message: 'Video generation started',
    });
  } catch (error: any) {
    logger.error('Error in /api/v1/video/generate', { error: error.message });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/v1/video/job/:jobId
 * Get job status
 */
router.get('/job/:jobId', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        status: true,
        videoUrl: true,
        errorMessage: true,
        prompt: true,
        createdAt: true,
        userId: true,
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check if user owns this job or is admin
    if (job.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      jobId: job.id,
      status: job.status,
      videoUrl: job.videoUrl,
      errorMessage: job.errorMessage,
      prompt: job.prompt,
      createdAt: job.createdAt,
    });
  } catch (error: any) {
    logger.error('Error in /api/v1/video/job/:jobId', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

