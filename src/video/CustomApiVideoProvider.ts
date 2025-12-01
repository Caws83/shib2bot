/**
 * Custom API video provider
 * Calls your own video generation API service
 */

import axios, { AxiosInstance } from 'axios';
import { IVideoProvider, GenerateVideoOptions } from './IVideoProvider';
import { logger } from '../utils/logger';

export class CustomApiVideoProvider implements IVideoProvider {
  private apiClient: AxiosInstance;
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    
    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 180000, // 3 minutes timeout (video generation takes time)
    });
  }

  /**
   * Generates a video using your custom API
   */
  async generateVideo(options: GenerateVideoOptions): Promise<string> {
    const { prompt, durationSeconds = 10, aspectRatio = '16:9' } = options;

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 500) {
      throw new Error('Prompt is too long (max 500 characters)');
    }

    logger.info('CustomApiVideoProvider: Starting video generation', {
      prompt,
      durationSeconds,
      aspectRatio,
      apiUrl: this.apiUrl,
    });

    try {
      const response = await this.apiClient.post('/generate', {
        prompt,
        duration: durationSeconds,
        aspect_ratio: aspectRatio,
      });

      if (response.data.success && response.data.video_url) {
        logger.info('CustomApiVideoProvider: Video generated successfully', {
          videoUrl: response.data.video_url,
        });
        return response.data.video_url;
      }

      if (response.data.video_url) {
        return response.data.video_url;
      }

      throw new Error('API returned success but no video URL');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
        
        logger.error('CustomApiVideoProvider: Video generation failed', {
          status,
          error: errorMessage,
          apiUrl: this.apiUrl,
        });

        if (status === 400) {
          throw new Error(`Invalid request: ${errorMessage}`);
        } else if (status === 500) {
          throw new Error(`API server error: ${errorMessage}`);
        } else if (status === 503) {
          throw new Error(`API service unavailable. The video model may be loading. Please try again in a moment.`);
        } else {
          throw new Error(`Video generation failed (HTTP ${status}): ${errorMessage}`);
        }
      }
      
      logger.error('CustomApiVideoProvider: Unexpected error', error);
      throw error;
    }
  }
}

