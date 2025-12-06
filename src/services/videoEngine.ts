/**
 * Video Engine Service
 * Handles communication with external video inference API (AWS or any HTTP-based service)
 * Platform-agnostic: just makes HTTP requests, no AWS SDK dependencies
 */

import axios, { AxiosInstance } from 'axios';
import { PrismaClient, JobStatus } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface VideoJobOptions {
  modelName?: string;
  durationSeconds?: number;
  otherModelParams?: Record<string, any>;
}

export interface VideoEngineResponse {
  jobId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  videoUrl?: string;
  error?: string;
}

/**
 * Request video generation from external inference server
 * This runs asynchronously and updates the Job record when complete
 * Works with any HTTP-based inference API (AWS, self-hosted, etc.)
 */
export async function requestVideoGeneration(
  jobId: string,
  prompt: string,
  options: VideoJobOptions = {}
): Promise<void> {
  const baseUrl = process.env.VIDEO_ENGINE_BASE_URL || 'https://veo-engine.internal.my-domain.com';
  const apiKey = process.env.VIDEO_ENGINE_API_KEY || '';

  logger.info('Requesting video generation from inference engine', {
    jobId,
    baseUrl,
    prompt: prompt.substring(0, 50) + '...',
    options,
  });

  try {
    // Update job status to RUNNING
    await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.RUNNING },
    });

    // Mock implementation for development/testing
    // In production, this will call your inference server (AWS or any HTTP API)
    if (process.env.NODE_ENV === 'development' || baseUrl.includes('internal.my-domain.com') || !baseUrl || baseUrl === '') {
      // Mock implementation for development
      logger.info('Using mock video engine (development mode or no VIDEO_ENGINE_BASE_URL set)');
      await mockVideoGeneration(jobId, prompt, options);
      return;
    }

    // Real inference API call (HTTP-based, works with any server)
    const axiosInstance: AxiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 300000, // 5 minutes
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey ? `Bearer ${apiKey}` : '',
      },
    });

    const requestBody = {
      prompt,
      durationSeconds: options.durationSeconds || 10,
      modelName: options.modelName || 'default',
      ...options.otherModelParams,
    };

    // Make the request to AWS inference server
    const response = await axiosInstance.post<VideoEngineResponse>('/generate-video', requestBody);

    // Handle response
    if (response.data.status === 'COMPLETED' && response.data.videoUrl) {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: JobStatus.COMPLETED,
          videoUrl: response.data.videoUrl,
        },
      });

      logger.info('Video generation completed', { jobId, videoUrl: response.data.videoUrl });
    } else if (response.data.status === 'FAILED') {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          errorMessage: response.data.error || 'Video generation failed',
        },
      });

      logger.error('Video generation failed', { jobId, error: response.data.error });
    } else {
      // Status is RUNNING - we need to poll
      // For now, we'll poll in the background
      pollJobStatus(jobId, response.data.jobId || jobId);
    }
  } catch (error: any) {
    logger.error('Error calling video inference engine', { jobId, error: error.message });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        errorMessage: error.message || 'Failed to connect to video engine',
      },
    });
  }
}

/**
 * Poll job status from inference server
 */
async function pollJobStatus(jobId: string, engineJobId: string): Promise<void> {
  const baseUrl = process.env.VIDEO_ENGINE_BASE_URL || 'https://veo-engine.internal.my-domain.com';
  const apiKey = process.env.VIDEO_ENGINE_API_KEY || '';

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      'Authorization': apiKey ? `Bearer ${apiKey}` : '',
    },
  });

  const maxAttempts = 60; // 5 minutes max (5 second intervals)
  let attempts = 0;

  const pollInterval = setInterval(async () => {
    attempts++;

    try {
      const response = await axiosInstance.get<VideoEngineResponse>(`/job/${engineJobId}`);

      if (response.data.status === 'COMPLETED' && response.data.videoUrl) {
        clearInterval(pollInterval);
        await prisma.job.update({
          where: { id: jobId },
          data: {
            status: JobStatus.COMPLETED,
            videoUrl: response.data.videoUrl,
          },
        });
        logger.info('Video generation completed via polling', { jobId });
      } else if (response.data.status === 'FAILED') {
        clearInterval(pollInterval);
        await prisma.job.update({
          where: { id: jobId },
          data: {
            status: JobStatus.FAILED,
            errorMessage: response.data.error || 'Video generation failed',
          },
        });
        logger.error('Video generation failed via polling', { jobId });
      }
    } catch (error: any) {
      logger.error('Error polling job status', { jobId, error: error.message });
    }

    if (attempts >= maxAttempts) {
      clearInterval(pollInterval);
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          errorMessage: 'Job timeout - video generation took too long',
        },
      });
      logger.error('Job polling timeout', { jobId });
    }
  }, 5000); // Poll every 5 seconds
}

/**
 * Mock video generation for development/testing
 */
async function mockVideoGeneration(
  jobId: string,
  prompt: string,
  options: VideoJobOptions
): Promise<void> {
  // Simulate processing time (3-5 seconds)
  const delay = 3000 + Math.random() * 2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Return a sample video URL
  const videoUrl = 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4';

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.COMPLETED,
      videoUrl,
    },
  });

  logger.info('Mock video generation completed', { jobId, videoUrl });
}

