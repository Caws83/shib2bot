/**
 * Video provider factory
 * Instantiates the correct video provider based on environment configuration
 */

import { IVideoProvider } from './IVideoProvider';
import { DummyVideoProvider } from './DummyVideoProvider';
import { PikaVideoProvider } from './PikaVideoProvider';
import { Veo3VideoProvider } from './Veo3VideoProvider';
import { FalAiVideoProvider } from './FalAiVideoProvider';
import { CustomApiVideoProvider } from './CustomApiVideoProvider';
import { logger } from '../utils/logger';

export type VideoProviderType = 'dummy' | 'pika' | 'veo3' | 'falai' | 'custom';

/**
 * Creates a video provider instance based on the provider type
 * @param providerType - The type of provider to create
 * @param apiKey - API key for providers that require it
 * @returns An instance of the requested video provider
 */
export const createVideoProvider = (providerType: string, apiKey: string = ''): IVideoProvider => {
  const normalizedType = (providerType || '').toLowerCase().trim();
  
  // FORCE DUMMY if not in production (local development)
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldForceDummy = !isProduction || process.env.FORCE_DUMMY === 'true';
  
  // Log what we received for debugging
  logger.info('createVideoProvider called', {
    providerType,
    normalizedType,
    hasApiKey: !!apiKey,
    isProduction,
    shouldForceDummy,
  });

  // FORCE dummy in development mode
  if (shouldForceDummy && normalizedType !== 'dummy' && normalizedType !== 'demo') {
    logger.warn(`⚠ FORCING DummyVideoProvider (was: ${normalizedType}). This is development mode.`);
    return new DummyVideoProvider();
  }

  switch (normalizedType) {
    case 'dummy':
    case 'demo':  // Accept 'demo' as alias for 'dummy'
      logger.info('✓ Using DummyVideoProvider for testing (demo mode) - NO API KEYS NEEDED');
      return new DummyVideoProvider();

    case 'veo3':
      if (!apiKey) {
        logger.warn('Veo3VideoProvider requires an API key. Falling back to DummyVideoProvider.');
        return new DummyVideoProvider();
      }
      logger.info('Using Veo3VideoProvider');
      return new Veo3VideoProvider(apiKey);

    case 'falai':
    case 'fal':
      if (!apiKey) {
        logger.warn('FalAiVideoProvider requires an API key. Falling back to DummyVideoProvider.');
        return new DummyVideoProvider();
      }
      logger.info('Using FalAiVideoProvider');
      // Create a wrapper that falls back to dummy on balance/credit errors
      const falProvider = new FalAiVideoProvider(apiKey);
      const dummyProvider = new DummyVideoProvider();
      
      return new class implements IVideoProvider {
        async generateVideo(options: GenerateVideoOptions): Promise<string> {
          try {
            return await falProvider.generateVideo(options);
          } catch (error: any) {
            // If Fal.ai fails (no credits, balance exhausted, etc), fallback to dummy
            const errorMsg = error?.message || '';
            const errorBody = error?.body?.detail || '';
            if (error?.status === 403 || errorMsg.includes('balance') || errorMsg.includes('credits') || errorBody.includes('balance') || errorBody.includes('Exhausted')) {
              logger.warn('Fal.ai failed (no credits/balance), automatically falling back to DummyVideoProvider');
              return await dummyProvider.generateVideo(options);
            }
            throw error;
          }
        }
      }();

    case 'custom':
      const customApiUrl = process.env.CUSTOM_API_URL || apiKey; // Use apiKey as URL if CUSTOM_API_URL not set
      if (!customApiUrl) {
        logger.warn('CustomApiVideoProvider requires CUSTOM_API_URL. Falling back to DummyVideoProvider.');
        return new DummyVideoProvider();
      }
      logger.info('Using CustomApiVideoProvider', { apiUrl: customApiUrl });
      return new CustomApiVideoProvider(customApiUrl);

    case 'pika':
      if (!apiKey) {
        logger.warn('PikaVideoProvider requires an API key. Falling back to DummyVideoProvider.');
        return new DummyVideoProvider();
      }
      logger.info('Using PikaVideoProvider');
      return new PikaVideoProvider(apiKey);

    default:
      logger.warn(`Unknown video provider type: ${providerType}. Falling back to DummyVideoProvider.`);
      return new DummyVideoProvider();
  }
};

