/**
 * Video provider interface for AI video generation
 * This abstraction allows plugging in multiple video providers (Pika, Luma, Runway, etc.)
 */

export interface GenerateVideoOptions {
  prompt: string;
  durationSeconds?: number;
  aspectRatio?: string;
}

/**
 * Interface that all video providers must implement
 */
export interface IVideoProvider {
  /**
   * Generates a video based on the provided options
   * @param options - Video generation parameters
   * @returns Promise that resolves to a video URL or file path
   */
  generateVideo(options: GenerateVideoOptions): Promise<string>;
}

