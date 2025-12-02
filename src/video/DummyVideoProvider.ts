/**
 * Dummy video provider for local testing
 * Simulates video generation by waiting a few seconds and returning a placeholder URL
 */

import { IVideoProvider, GenerateVideoOptions } from './IVideoProvider';
import { logger } from '../utils/logger';

export class DummyVideoProvider implements IVideoProvider {
  /**
   * Simulates video generation
   * Waits 3-5 seconds and returns a placeholder video URL
   */
  async generateVideo(options: GenerateVideoOptions): Promise<string> {
    const { prompt, durationSeconds = 10, aspectRatio = '16:9' } = options;

    logger.info('DummyVideoProvider: Starting video generation', {
      prompt,
      durationSeconds,
      aspectRatio,
    });

    // Simulate processing time (3-5 seconds)
    const delay = 3000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Return a placeholder video URL
    // Using a reliable sample video service (same as Python demo provider)
    const videoUrl = 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4';

    logger.info('DummyVideoProvider: Video generation complete', { videoUrl });

    return videoUrl;
  }
}

