/**
 * Fal.ai video provider implementation
 * Fal.ai API: https://fal.ai
 * 
 * Get API key: https://fal.ai/dashboard
 */

import axios, { AxiosInstance } from 'axios';
import { IVideoProvider, GenerateVideoOptions } from './IVideoProvider';
import { logger } from '../utils/logger';

interface FalAiGenerateResponse {
  request_id?: string;
  video_url?: string;
  status?: string;
  error?: string;
}

interface FalAiStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  video?: {
    url?: string;
  };
  error?: string;
}

export class FalAiVideoProvider implements IVideoProvider {
  private apiClient: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Fal.ai uses fal.run as base URL
    this.baseUrl = process.env.FAL_AI_API_BASE_URL || 'https://fal.run';
    
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout
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
   * Submits a video generation job to Fal.ai API
   */
  private async submitJob(options: GenerateVideoOptions): Promise<string> {
    const { prompt, durationSeconds = 10, aspectRatio = '16:9' } = options;

    logger.info('FalAiVideoProvider: Submitting video generation job', {
      prompt,
      durationSeconds,
      aspectRatio,
    });

    try {
      // Fal.ai endpoints for video generation
      // Try text-to-video models first, then image-to-video models
      const endpoints = [
        'fal-ai/animate',                    // Text-to-video animation
        'fal-ai/minimax-video',              // Text-to-video (might work)
        'fal-ai/stable-video-diffusion',     // Might work with text
        'fal-ai/stable-video',               // Might work with text
      ];

      let lastError: any = null;
      
      for (const endpoint of endpoints) {
        try {
          logger.debug(`FalAiVideoProvider: Trying endpoint ${endpoint}`);
          
          // Fal.ai request format - try different body structures
          // Try text-to-video formats first (no image_url needed)
          const requestBodies = [
            // Format 1: Standard text-to-video format
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
            // Format 3: prompt_text format (some models use this)
            {
              prompt_text: prompt,
              aspect_ratio: this.mapAspectRatio(aspectRatio),
            },
            // Format 4: input format (some Fal.ai models use this)
            {
              input: {
                prompt,
                aspect_ratio: this.mapAspectRatio(aspectRatio),
              },
            },
            // Format 5: Just prompt (minimal)
            {
              prompt,
            },
          ];

          let response: any = null;
          let lastBodyError: any = null;

          for (const body of requestBodies) {
            try {
              logger.debug(`FalAiVideoProvider: Trying body format`, body);
              response = await this.apiClient.post<FalAiGenerateResponse>(
                `/${endpoint}`,
                body
              );

              if (response.status === 200 || response.status === 201) {
                logger.info(`FalAiVideoProvider: Successfully used endpoint ${endpoint} with body format`);
                break; // Success!
              }
            } catch (bodyError: any) {
              lastBodyError = bodyError;
              // If it's a 422, try next body format
              if (axios.isAxiosError(bodyError) && bodyError.response?.status === 422) {
                continue; // Try next body format
              }
              // For other errors (401, 403, etc.), throw immediately
              throw bodyError;
            }
          }

          if (!response || (response.status !== 200 && response.status !== 201)) {
            throw lastBodyError || new Error('All request body formats failed');
          }

          // If we get a successful response, use it
          if (response.status === 200 || response.status === 201) {
            logger.info(`FalAiVideoProvider: Successfully used endpoint ${endpoint}`);
            
            // Fal.ai might return video_url directly or request_id
            if (response.data.video_url) {
              logger.info('FalAiVideoProvider: Video generated immediately', {
                videoUrl: response.data.video_url,
              });
              return response.data.video_url;
            }

            if (response.data.request_id) {
              logger.info('FalAiVideoProvider: Job submitted successfully', {
                requestId: response.data.request_id,
              });
              return response.data.request_id;
            }

            if (response.data.error) {
              throw new Error(`Fal.ai API error: ${response.data.error}`);
            }

            // Try to extract request_id from response
            const requestId = (response.data as any).id || (response.data as any).job_id;
            if (requestId) {
              return requestId;
            }
          }
        } catch (endpointError: any) {
          lastError = endpointError;
          // If it's 404, try next endpoint
          // If it's 422, try next endpoint (wrong format)
          // For other errors (401, 403, etc.), throw immediately
          if (axios.isAxiosError(endpointError)) {
            const status = endpointError.response?.status;
            if (status === 404 || status === 422) {
              continue; // Try next endpoint
            }
            // For auth errors, rate limits, etc., throw immediately
            throw endpointError;
          }
          throw endpointError;
        }
      }

      // If all endpoints failed, throw the last error
      throw lastError || new Error('All Fal.ai API endpoints failed');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        const errorMessage = errorData?.error || errorData?.message || error.message;
        
        logger.error('FalAiVideoProvider: Failed to submit job', {
          status,
          error: errorMessage,
          responseData: errorData,
          url: error.config?.url,
        });

        // Provide helpful error messages
        if (status === 401 || status === 403) {
          throw new Error(`Fal.ai API authentication failed. Please check your API key. Status: ${status}`);
        } else if (status === 404) {
          throw new Error(`Fal.ai API endpoint not found. Tried: ${this.baseUrl}. Please check Fal.ai documentation.`);
        } else if (status === 422) {
          // 422 means invalid request format - log the actual error from Fal.ai
          logger.error('Fal.ai API 422 error details', { 
            errorData, 
            status,
            fullResponse: JSON.stringify(errorData, null, 2)
          });
          
          // Extract detailed error message
          let falError = errorMessage;
          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              falError = errorData.detail.map((err: any) => {
                if (typeof err === 'string') return err;
                if (err?.msg) return err.msg;
                if (err?.loc) return `${err.loc.join('.')}: ${err.msg || JSON.stringify(err)}`;
                return JSON.stringify(err);
              }).join('; ');
            } else if (typeof errorData.detail === 'string') {
              falError = errorData.detail;
            } else {
              falError = JSON.stringify(errorData.detail);
            }
          } else if (errorData?.message) {
            falError = errorData.message;
          }
          
          throw new Error(`Fal.ai API request format invalid: ${falError}. Please check Fal.ai API documentation for correct format.`);
        } else if (status === 429) {
          throw new Error(`Fal.ai API rate limit exceeded. Please try again later.`);
        } else {
          throw new Error(`Failed to submit video generation job (HTTP ${status}): ${errorMessage}`);
        }
      }
      throw error;
    }
  }

  /**
   * Polls the job status until completion
   */
  private async pollJobStatus(requestId: string, maxAttempts: number = 120): Promise<string> {
    const pollInterval = 3000; // Poll every 3 seconds
    let attempts = 0;

    logger.info('FalAiVideoProvider: Polling job status', { requestId });

    while (attempts < maxAttempts) {
      try {
        // Fal.ai status endpoint
        const response = await this.apiClient.get<FalAiStatusResponse>(`/requests/${requestId}`);

        const status = response.data.status?.toUpperCase();

        if (status === 'COMPLETED') {
          if (response.data.video?.url) {
            logger.info('FalAiVideoProvider: Job completed successfully', {
              requestId,
              videoUrl: response.data.video.url,
            });
            return response.data.video.url;
          } else {
            throw new Error('Job completed but no video URL in response');
          }
        }

        if (status === 'FAILED') {
          const errorMsg = response.data.error || 'Unknown error';
          throw new Error(`Video generation failed: ${errorMsg}`);
        }

        // Job is still processing
        logger.debug('FalAiVideoProvider: Job still processing', {
          requestId,
          status,
          attempt: attempts + 1,
        });

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        attempts++;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            throw new Error(`Job not found: ${requestId}`);
          }
          const errorMessage = error.response?.data?.error || error.message;
          throw new Error(`Failed to check job status: ${errorMessage}`);
        }
        throw error;
      }
    }

    throw new Error(`Video generation timed out after ${maxAttempts} attempts (${maxAttempts * pollInterval / 1000} seconds)`);
  }

  /**
   * Generates a video using Fal.ai API
   */
  async generateVideo(options: GenerateVideoOptions): Promise<string> {
    const { prompt } = options;

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 500) {
      throw new Error('Prompt is too long (max 500 characters)');
    }

    try {
      // Step 1: Submit the job
      const requestIdOrUrl = await this.submitJob(options);

      // If we got a URL directly, return it
      if (requestIdOrUrl.startsWith('http://') || requestIdOrUrl.startsWith('https://')) {
        return requestIdOrUrl;
      }

      // Step 2: Poll for completion
      const videoUrl = await this.pollJobStatus(requestIdOrUrl);

      return videoUrl;
    } catch (error) {
      logger.error('FalAiVideoProvider: Video generation failed', error);
      throw error;
    }
  }
}

