/**
 * Video provider factory
 * Instantiates the correct video provider based on environment configuration
 */

import { IVideoProvider } from './IVideoProvider';
import { DummyVideoProvider } from './DummyVideoProvider';
import { PikaVideoProvider } from './PikaVideoProvider';
import { Veo3VideoProvider } from './Veo3VideoProvider';
import { logger } from '../utils/logger';

export type VideoProviderType = 'dummy' | 'pika' | 'veo3';

/**
 * Creates a video provider instance based on the provider type
 * @param providerType - The type of provider to create
 * @param apiKey - API key for providers that require it
 * @returns An instance of the requested video provider
 */
export const createVideoProvider = (providerType: string, apiKey: string = ''): IVideoProvider => {
  const normalizedType = providerType.toLowerCase();

  switch (normalizedType) {
    case 'dummy':
      logger.info('Using DummyVideoProvider for testing');
      return new DummyVideoProvider();

    case 'veo3':
      if (!apiKey) {
        logger.warn('Veo3VideoProvider requires an API key. Falling back to DummyVideoProvider.');
        return new DummyVideoProvider();
      }
      logger.info('Using Veo3VideoProvider');
      return new Veo3VideoProvider(apiKey);

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

