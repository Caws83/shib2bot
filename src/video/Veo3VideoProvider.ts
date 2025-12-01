/**
 * VEO3 video provider implementation
 * VEO3 API: https://www.veo3gen.co/info/endpoints
 * 
 * Get API key: https://www.veo3gen.co/info/installation
 */

import axios, { AxiosInstance } from 'axios';
import { IVideoProvider, GenerateVideoOptions } from './IVideoProvider';
import { logger } from '../utils/logger';

interface Veo3GenerateResponse {
  job_id?: string;
  video_url?: string;
  status?: string;
  error?: string;
}

interface Veo3StatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
}

export class Veo3VideoProvider implements IVideoProvider {
  private apiClient: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // VEO3 API base URL - try different possible endpoints
    this.baseUrl = process.env.VEO3_API_BASE_URL || 'https://api.veo3gen.co';
    
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-API-Key': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`, // Try both header formats
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout for initial request
    });
  }

  /**
   * Maps aspect ratio to VEO3 format
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
   * Submits a video generation job to VEO3 API
   */
  private async submitJob(options: GenerateVideoOptions): Promise<string> {
    const { prompt, durationSeconds = 10, aspectRatio = '16:9' } = options;

    logger.info('Veo3VideoProvider: Submitting video generation job', {
      prompt,
      durationSeconds,
      aspectRatio,
    });

    try {
      // VEO3 API endpoint for video generation
      // Try multiple possible endpoint formats
      const endpoints = [
        '/api/v1/generate',
        '/v1/generate',
        '/api/generate',
        '/generate',
        '/api/veo/generate',
      ];

      let lastError: any = null;
      
      for (const endpoint of endpoints) {
        try {
          logger.debug(`Veo3VideoProvider: Trying endpoint ${endpoint}`);
          
          const response = await this.apiClient.post<Veo3GenerateResponse>(endpoint, {
            prompt,
            duration: durationSeconds,
            aspect_ratio: this.mapAspectRatio(aspectRatio),
            model: 'veo-3.0-generate', // VEO3 model name
          });

          // If we get a successful response, use it
          if (response.status === 200 || response.status === 201) {
            logger.info(`Veo3VideoProvider: Successfully used endpoint ${endpoint}`);
            
            if (response.data.job_id) {
              logger.info('Veo3VideoProvider: Job submitted successfully', {
                jobId: response.data.job_id,
              });
              return response.data.job_id;
            }

            // If video_url is returned directly (synchronous response)
            if (response.data.video_url) {
              logger.info('Veo3VideoProvider: Video generated immediately', {
                videoUrl: response.data.video_url,
              });
              return response.data.video_url;
            }

            if (response.data.error) {
              throw new Error(`VEO3 API error: ${response.data.error}`);
            }

            throw new Error('Invalid response from VEO3 API: missing job_id or video_url');
          }
        } catch (endpointError: any) {
          lastError = endpointError;
          // If it's not a 404, throw immediately (auth error, etc.)
          if (axios.isAxiosError(endpointError) && endpointError.response?.status !== 404) {
            throw endpointError;
          }
          // Otherwise, try next endpoint
          continue;
        }
      }

      // If all endpoints failed, throw the last error
      throw lastError || new Error('All VEO3 API endpoints failed');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        logger.error('Veo3VideoProvider: Failed to submit job', {
          status: error.response?.status,
          error: errorMessage,
        });
        throw new Error(`Failed to submit video generation job: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Polls the job status until completion
   */
  private async pollJobStatus(jobId: string, maxAttempts: number = 120): Promise<string> {
    const pollInterval = 3000; // Poll every 3 seconds (VEO3 may take longer)
    let attempts = 0;

    logger.info('Veo3VideoProvider: Polling job status', { jobId });

    while (attempts < maxAttempts) {
      try {
        // VEO3 status endpoint
        const response = await this.apiClient.get<Veo3StatusResponse>(`/v1/status/${jobId}`);

        const status = response.data.status?.toLowerCase();

        if (status === 'completed') {
          if (response.data.video_url) {
            logger.info('Veo3VideoProvider: Job completed successfully', {
              jobId,
              videoUrl: response.data.video_url,
            });
            return response.data.video_url;
          } else {
            throw new Error('Job completed but no video URL in response');
          }
        }

        if (status === 'failed') {
          const errorMsg = response.data.error || 'Unknown error';
          throw new Error(`Video generation failed: ${errorMsg}`);
        }

        // Job is still processing
        logger.debug('Veo3VideoProvider: Job still processing', {
          jobId,
          status,
          attempt: attempts + 1,
        });

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        attempts++;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            throw new Error(`Job not found: ${jobId}`);
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
   * Generates a video using VEO3 API
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
      const jobIdOrUrl = await this.submitJob(options);

      // If we got a URL directly, return it
      if (jobIdOrUrl.startsWith('http://') || jobIdOrUrl.startsWith('https://')) {
        return jobIdOrUrl;
      }

      // Step 2: Poll for completion
      const videoUrl = await this.pollJobStatus(jobIdOrUrl);

      return videoUrl;
    } catch (error) {
      logger.error('Veo3VideoProvider: Video generation failed', error);
      throw error;
    }
  }
}

