/**
 * Telegram bot command handlers
 */

import { Context } from 'telegraf';
import { IVideoProvider } from '../video/IVideoProvider';
import { parsePrompt } from '../utils/promptParser';
import { logger } from '../utils/logger';

const DEFAULT_DURATION = 10;
const DEFAULT_ASPECT_RATIO = '16:9';

/**
 * Handles the /start command
 */
export const handleStart = async (ctx: Context): Promise<void> => {
  try {
    const welcomeMessage = `🐕 SHIB2BOT is here! 🚀

Rebuilding the ShibArmy ecosystem with stealth launch - fair for everyone! 💎

🎬 Generate AI videos with /video command

Example: /video shiba inu flying through a neon city, 10 seconds, 16:9

You can specify:
• Duration: "5s", "10 seconds", etc. (default: ${DEFAULT_DURATION}s)
• Aspect ratio: "16:9", "9:16", "1:1" (default: ${DEFAULT_ASPECT_RATIO})

Let's create something amazing! 🌟`;

    await ctx.reply(welcomeMessage);
    logger.info('Start command handled', { userId: ctx.from?.id });
  } catch (error) {
    logger.error('Error handling /start command', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
};

/**
 * Handles the /video command
 */
export const handleVideo = async (ctx: Context, videoProvider: IVideoProvider): Promise<void> => {
  try {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Please send a text message with the /video command.');
      return;
    }

    const messageText = ctx.message.text;
    
    // Extract command arguments (everything after /video)
    const args = messageText.replace(/^\/video\s*/i, '').trim();

    if (!args || args.length === 0) {
      const usageMessage = `📹 Video Generation

Usage: /video <prompt> [duration] [aspect ratio]

Examples:
• /video cyberpunk shiba inu running through neon Tokyo
• /video sunset over mountains, 10 seconds, 16:9
• /video dancing robot, 5s, 1:1

Parameters:
• Prompt: Required. Describe the video you want to generate.
• Duration: Optional. "5s", "10 seconds", etc. (default: ${DEFAULT_DURATION}s)
• Aspect ratio: Optional. "16:9", "9:16", "1:1" (default: ${DEFAULT_ASPECT_RATIO})`;

      await ctx.reply(usageMessage);
      return;
    }

    // Validate prompt length
    if (args.length > 500) {
      await ctx.reply('❌ Prompt is too long. Please keep it under 500 characters.');
      return;
    }

    // Parse the prompt
    const parsed = parsePrompt(args);
    const prompt = parsed.prompt.trim();

    if (!prompt || prompt.length === 0) {
      await ctx.reply('❌ Please provide a valid prompt describing the video you want to generate.');
      return;
    }

    // Validate minimum prompt length
    if (prompt.length < 3) {
      await ctx.reply('❌ Prompt is too short. Please provide a more detailed description.');
      return;
    }

    const durationSeconds = parsed.durationSeconds || DEFAULT_DURATION;
    const aspectRatio = parsed.aspectRatio || DEFAULT_ASPECT_RATIO;

    logger.info('Video generation requested', {
      userId: ctx.from?.id,
      prompt,
      durationSeconds,
      aspectRatio,
    });

    // Send immediate feedback
    const statusMessage = await ctx.reply('⏳ Generating your video... This may take a moment.');

    try {
      // Generate video
      const videoUrl = await videoProvider.generateVideo({
        prompt,
        durationSeconds,
        aspectRatio,
      });

      logger.info('Video generated successfully', {
        userId: ctx.from?.id,
        videoUrl,
      });

      // Create caption with metadata
      const caption = `🎬 ${prompt}\n\n⏱ Duration: ${durationSeconds}s | 📐 Aspect: ${aspectRatio}`;

      // Send video to user
      await ctx.telegram.sendVideo(ctx.chat!.id, videoUrl, {
        caption,
        reply_parameters: {
          message_id: statusMessage.message_id,
        },
      });

      // Delete the status message
      await ctx.telegram.deleteMessage(ctx.chat!.id, statusMessage.message_id);
    } catch (error) {
      logger.error('Error generating video', error);

      // Delete status message
      try {
        await ctx.telegram.deleteMessage(ctx.chat!.id, statusMessage.message_id);
      } catch (deleteError) {
        // Ignore delete errors
      }

      // Send error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while generating the video.';
      
      await ctx.reply(`❌ Sorry, I couldn't generate your video.\n\nError: ${errorMessage}\n\nPlease try again with a different prompt.`);
    }
  } catch (error) {
    logger.error('Error handling /video command', error);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
};

/**
 * Handles generic text messages (not commands)
 */
export const handleText = async (ctx: Context): Promise<void> => {
  try {
    if (!ctx.message || !('text' in ctx.message)) {
      return; // Not a text message, ignore
    }

    const messageText = ctx.message.text;
    
    // If message starts with /, it's likely a command we don't handle
    if (messageText.startsWith('/')) {
      await ctx.reply('Unknown command. Send /start to see available commands.');
      return;
    }

    // For non-command text, suggest using /video
    await ctx.reply(
      '💡 To generate a video, use the /video command.\n\n' +
      'Example: /video ' + messageText.substring(0, 50) + 
      (messageText.length > 50 ? '...' : '') +
      '\n\nSend /start for more information.'
    );
  } catch (error) {
    logger.error('Error handling text message', error);
  }
};

