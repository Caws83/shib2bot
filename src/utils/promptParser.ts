/**
 * Utility to parse duration and aspect ratio from user prompt text
 */

export interface ParsedPrompt {
  prompt: string;
  durationSeconds?: number;
  aspectRatio?: string;
}

/**
 * Extracts duration from text (e.g., "5s", "5 seconds", "10 sec", "10 seconds")
 * Returns duration in seconds, or undefined if not found
 */
const parseDuration = (text: string): number | undefined => {
  // Match patterns like "5s", "5 sec", "5 seconds", "10s", "10 sec", "10 seconds"
  const durationRegex = /(\d+)\s*(?:s|sec|second|seconds)/i;
  const match = text.match(durationRegex);
  
  if (match) {
    const seconds = parseInt(match[1], 10);
    // Validate reasonable range (1-60 seconds)
    if (seconds >= 1 && seconds <= 60) {
      return seconds;
    }
  }
  
  return undefined;
};

/**
 * Extracts aspect ratio from text (e.g., "16:9", "9:16", "1:1")
 * Returns the aspect ratio string, or undefined if not found
 */
const parseAspectRatio = (text: string): string | undefined => {
  // Match common aspect ratios: 16:9, 9:16, 1:1, 4:3, 3:4, 21:9
  const aspectRatioRegex = /\b(\d+:\d+)\b/;
  const match = text.match(aspectRatioRegex);
  
  if (match) {
    const ratio = match[1];
    // Validate common ratios
    const validRatios = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'];
    if (validRatios.includes(ratio)) {
      return ratio;
    }
  }
  
  return undefined;
};

/**
 * Removes duration and aspect ratio patterns from the prompt text
 */
const cleanPrompt = (text: string, durationSeconds?: number, aspectRatio?: string): string => {
  let cleaned = text;
  
  // Remove duration patterns
  if (durationSeconds) {
    cleaned = cleaned.replace(/\d+\s*(?:s|sec|second|seconds)/i, '').trim();
  }
  
  // Remove aspect ratio patterns
  if (aspectRatio) {
    cleaned = cleaned.replace(/\b\d+:\d+\b/, '').trim();
  }
  
  // Clean up extra commas and whitespace
  cleaned = cleaned.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

/**
 * Parses user input to extract prompt, duration, and aspect ratio
 * 
 * @param input - Raw user input text
 * @returns Parsed prompt with extracted metadata
 */
export const parsePrompt = (input: string): ParsedPrompt => {
  if (!input || input.trim().length === 0) {
    return { prompt: '' };
  }
  
  const trimmed = input.trim();
  
  // Extract duration and aspect ratio
  const durationSeconds = parseDuration(trimmed);
  const aspectRatio = parseAspectRatio(trimmed);
  
  // Clean the prompt by removing extracted metadata
  const prompt = cleanPrompt(trimmed, durationSeconds, aspectRatio);
  
  return {
    prompt,
    durationSeconds,
    aspectRatio,
  };
};

