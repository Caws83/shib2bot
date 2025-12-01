/**
 * Simple Video Generation API Service
 * Uses Hugging Face Inference API (free tier available)
 * Deploy to AWS Lambda or Railway
 */

import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import axios from 'axios';
import { logger } from './logger';

const app: Express = express();
app.use(express.json());

// Hugging Face API configuration
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HF_API_URL = process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models';

// Video generation models (text-to-video)
const VIDEO_MODELS = [
  'stabilityai/stable-video-diffusion-img2vid',
  'cerspense/zeroscope_v2_576w',
  'anotherjesse/zeroscope_v2_XL',
];

interface GenerateRequest {
  prompt: string;
  duration?: number;
  aspect_ratio?: string;
}

/**
 * Generate video using Hugging Face Inference API
 */
async function generateVideo(prompt: string, aspectRatio: string = '16:9'): Promise<string> {
  // Try different models until one works
  for (const model of VIDEO_MODELS) {
    try {
      logger.info(`Trying model: ${model}`);
      
      const response = await axios.post(
        `${HF_API_URL}/${model}`,
        {
          inputs: prompt,
          parameters: {
            num_inference_steps: 25,
            guidance_scale: 7.5,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minutes
        }
      );

      // Hugging Face returns video URL or base64
      if (response.data?.video_url) {
        return response.data.video_url;
      }

      if (response.data?.url) {
        return response.data.url;
      }

      // If it's base64, we'd need to upload it somewhere
      // For now, return a placeholder
      logger.warn('Model returned data but no URL', { model });
    } catch (error: any) {
      logger.error(`Model ${model} failed`, {
        status: error.response?.status,
        error: error.message,
      });
      
      // If it's a model loading error, wait and retry
      if (error.response?.status === 503) {
        logger.info(`Model ${model} is loading, will retry later`);
        // Could implement retry logic here
      }
      
      continue; // Try next model
    }
  }

  throw new Error('All video generation models failed');
}

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'video-generation-api' });
});

/**
 * Generate video endpoint
 */
app.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, duration, aspect_ratio } = req.body as GenerateRequest;

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt too long (max 500 characters)' });
    }

    logger.info('Video generation requested', { prompt, duration, aspect_ratio });

    // Generate video
    const videoUrl = await generateVideo(prompt, aspect_ratio || '16:9');

    res.json({
      success: true,
      video_url: videoUrl,
      prompt,
      duration: duration || 10,
      aspect_ratio: aspect_ratio || '16:9',
    });
  } catch (error: any) {
    logger.error('Video generation failed', error);
    res.status(500).json({
      error: 'Video generation failed',
      message: error.message,
    });
  }
});

/**
 * Root endpoint
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Video Generation API',
    endpoints: {
      health: '/health',
      generate: 'POST /generate',
    },
    usage: {
      method: 'POST',
      url: '/generate',
      body: {
        prompt: 'your video description',
        duration: 10,
        aspect_ratio: '16:9',
      },
    },
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Video Generation API started on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Generate: POST http://localhost:${PORT}/generate`);
});

export default app;

