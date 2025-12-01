/**
 * Simple logger for video API service
 */

export const logger = {
  info: (message: string, ...args: any[]): void => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, ...args);
  },

  error: (message: string, ...args: any[]): void => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`, ...args);
  },

  warn: (message: string, ...args: any[]): void => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`, ...args);
  },

  debug: (message: string, ...args: any[]): void => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [DEBUG] ${message}`, ...args);
  },
};

