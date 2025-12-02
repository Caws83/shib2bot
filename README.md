# SHIB2BOT - Telegram AI Video Bot

A simple Telegram bot that generates AI videos from text prompts. Works out of the box with free dummy provider, or connect to real AI video APIs (Fal.ai, Veo3, Pika).

Perfect for deployment on Railway, Render, or any Node.js hosting platform.

## Quick Start for Railway

### Set Environment Variables on Railway:

1. Go to your Railway project → Your service → **Variables** tab
2. Set these variables:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VIDEO_PROVIDER=dummy
PORT=3000
```

**That's it!** The bot will work with dummy provider (free, no API keys needed).

### To Use a Real API Later:

Change `VIDEO_PROVIDER` to:
- `falai` - Fal.ai (requires API key)
- `veo3` - Veo3 (requires API key)  
- `pika` - Pika (requires API key)

The bot automatically falls back to dummy if APIs fail (no credits, etc).

## Local Development

```bash
npm install
npm run dev
```

Set `.env` file:
```
TELEGRAM_BOT_TOKEN=your_token
VIDEO_PROVIDER=dummy
```

## Commands

- `/start` - Welcome message
- `/video <prompt>` - Generate a video from text

Example: `/video cyberpunk shiba inu running through neon Tokyo`

## Providers

- **dummy** (default) - Free sample videos, no API keys needed
- **falai** - Fal.ai API (requires credits)
- **veo3** - Veo3 API
- **pika** - Pika API

See `RAILWAY_SETUP.md` for detailed Railway configuration.
