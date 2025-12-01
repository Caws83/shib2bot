/**
 * Fal.ai video provider implementation using official SDK
 * Fal.ai API: https://docs.fal.ai
 * 
 * Get API key: https://fal.ai/dashboard/keys
 */

import { fal } from '@fal-ai/client';
import { IVideoProvider, GenerateVideoOptions } from './IVideoProvider';
import { logger } from '../utils/logger';

export class FalAiVideoProvider implements IVideoProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    // Configure Fal.ai client with API key
    fal.config({
      credentials: this.apiKey,
    });
  }

  /**
   * Maps aspect ratio to Fal.ai format
   */
  private mapAspectRatio(aspectRatio: string): string {
    const ratioMap: Record<string, string> = {
      '16:9': '16:9',
      '9:16': '9:16',
      '1:1': '1:1',
      '4:3': '4:3',
      '3:4': '3:4',
      '21:9': '21:9',
    };
    return ratioMap[aspectRatio] || '16:9';
  }

  /**
   * Generates a video using Fal.ai SDK
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

    logger.info('FalAiVideoProvider: Starting video generation', {
      prompt,
      durationSeconds,
      aspectRatio,
    });

    try {
      // Try different Fal.ai text-to-video models
      // runway-gen3 requires image_url, so we skip it
      const models = [
        'fal-ai/animate',              // Text-to-video animation
        'fal-ai/minimax-video',        // Text-to-video
        'fal-ai/stable-video-diffusion', // Text-to-video
        'fal-ai/stable-video',         // Text-to-video
      ];

      let lastError: any = null;

      for (const model of models) {
        try {
          logger.debug(`FalAiVideoProvider: Trying model ${model}`);

          // Try different request formats
          const requestFormats = [
            // Format 1: With aspect ratio
            {
              prompt,
              aspect_ratio: this.mapAspectRatio(aspectRatio),
            },
            // Format 2: With duration
            {
              prompt,
              duration: durationSeconds,
              aspect_ratio: this.mapAspectRatio(aspectRatio),
            },
            // Format 3: Just prompt
            {
              prompt,
            },
          ];

          for (const input of requestFormats) {
            try {
              logger.debug(`FalAiVideoProvider: Trying format`, input);

              // Use Fal.ai queue.submit for async processing
              const { request_id } = await fal.queue.submit(model, {
                input,
              });

              logger.info('FalAiVideoProvider: Job submitted to queue', {
                model,
                requestId: request_id,
              });

              // Poll for completion
              const videoUrl = await this.pollQueueStatus(request_id);
              return videoUrl;
            } catch (formatError: any) {
              lastError = formatError;
              // If it's a validation error (422), try next format
              if (formatError?.status === 422 || formatError?.response?.status === 422) {
                logger.debug(`FalAiVideoProvider: Format failed, trying next`, {
                  error: formatError.message,
                });
                continue; // Try next format
              }
              // For other errors, try next model
              throw formatError;
            }
          }
        } catch (modelError: any) {
          lastError = modelError;
          // If it's 404 (model not found) or 422 (wrong format), try next model
          if (
            modelError?.status === 404 ||
            modelError?.status === 422 ||
            modelError?.response?.status === 404 ||
            modelError?.response?.status === 422
          ) {
            logger.debug(`FalAiVideoProvider: Model ${model} failed, trying next`, {
              error: modelError.message,
            });
            continue; // Try next model
          }
          // For auth errors, rate limits, etc., throw immediately
          throw modelError;
        }
      }

      // If all models/formats failed
      throw lastError || new Error('All Fal.ai models and formats failed');
    } catch (error) {
      logger.error('FalAiVideoProvider: Video generation failed', error);
      
      // Provide helpful error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorObj = error as any;
      
      // Check for credit/payment errors
      if (
        errorMessage.toLowerCase().includes('credit') ||
        errorMessage.toLowerCase().includes('payment') ||
        errorMessage.toLowerCase().includes('insufficient') ||
        errorObj?.status === 402 ||
        errorObj?.response?.status === 402
      ) {
        throw new Error('Fal.ai: Insufficient credits or payment required. Please add credits to your Fal.ai account at https://fal.ai/dashboard');
      }
      
      // Check for authentication errors
      if (errorObj?.status === 401 || errorObj?.status === 403 || errorObj?.response?.status === 401 || errorObj?.response?.status === 403) {
        throw new Error('Fal.ai API authentication failed. Please check your API key.');
      }
      
      // Check for validation errors
      if (errorObj?.status === 422 || errorObj?.response?.status === 422) {
        throw new Error('Fal.ai API request format invalid. The model may require different parameters or image input.');
      }
      
      // Check for rate limits
      if (errorObj?.status === 429 || errorObj?.response?.status === 429) {
        throw new Error('Fal.ai API rate limit exceeded. Please try again later.');
      }
      
      throw error;
    }
  }

  /**
   * Polls the Fal.ai queue status until completion
   */
  private async pollQueueStatus(requestId: string, maxAttempts: number = 120): Promise<string> {
    const pollInterval = 3000; // Poll every 3 seconds
    let attempts = 0;

    logger.info('FalAiVideoProvider: Polling queue status', { requestId });

    while (attempts < maxAttempts) {
      try {
        // Use Fal.ai SDK subscribe to wait for result
        // This will block until the job completes or fails
        const result = await fal.subscribe(`queue/${requestId}`, {});
        
        logger.debug('FalAiVideoProvider: Got result from queue', {
          requestId,
          hasResult: !!result,
          attempt: attempts + 1,
        });

        // Extract video URL from result
        const videoUrl = this.extractVideoUrl(result);
        if (videoUrl) {
          logger.info('FalAiVideoProvider: Video generated successfully', {
            requestId,
            videoUrl,
          });
          return videoUrl;
        }

        throw new Error('Job completed but no video URL found in response');
      } catch (error) {
        // If it's a status check error, handle it
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status === 404) {
            throw new Error(`Job not found: ${requestId}`);
          }
        }
        throw error;
      }
    }

    throw new Error(`Video generation timed out after ${maxAttempts} attempts (${maxAttempts * pollInterval / 1000} seconds)`);
  }

  /**
   * Extracts video URL from various response structures
   */
  private extractVideoUrl(response: any): string | null {
    if (!response) return null;

    // Try different possible structures
    if (typeof response === 'string' && response.startsWith('http')) {
      return response;
    }

    if (response.video?.url) {
      return response.video.url;
    }

    if (response.video_url) {
      return response.video_url;
    }

    if (response.url) {
      return response.url;
    }

    if (response.video && typeof response.video === 'string') {
      return response.video;
    }

    return null;
  }
}

