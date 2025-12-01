/**
 * Simple logging utility wrapper over console methods
 */

export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
  DEBUG = 'DEBUG',
}

const formatMessage = (level: LogLevel, message: string, ...args: any[]): string => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  return args.length > 0 ? `${prefix} ${message}` : `${prefix} ${message}`;
};

export const logger = {
  info: (message: string, ...args: any[]): void => {
    console.log(formatMessage(LogLevel.INFO, message, ...args), ...args);
  },

  error: (message: string, ...args: any[]): void => {
    console.error(formatMessage(LogLevel.ERROR, message, ...args), ...args);
  },

  warn: (message: string, ...args: any[]): void => {
    console.warn(formatMessage(LogLevel.WARN, message, ...args), ...args);
  },

  debug: (message: string, ...args: any[]): void => {
    console.log(formatMessage(LogLevel.DEBUG, message, ...args), ...args);
  },
};

