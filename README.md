# Veo3 Telegram Bot

A production-grade Node.js/TypeScript Telegram bot for AI video generation with a clean architecture supporting multiple video providers (Pika, Luma, Runway, etc.).

## Features

- 🤖 **Telegram Bot Integration** - Handle `/start` and `/video` commands
- 🎬 **AI Video Generation** - Generate videos from text prompts
- 🔌 **Provider Abstraction** - Easy to plug in multiple video providers
- 📐 **Flexible Parameters** - Support for custom duration and aspect ratios
- 🏥 **Health Checks** - HTTP server with health check endpoint
- 🐦 **Twitter/X Ready** - Stub for future Twitter integration

## Architecture

The project follows a clean architecture pattern:

```
src/
├── index.ts              # Entry point
├── config/               # Configuration management
├── bot/                  # Telegram bot logic
├── video/                # Video provider abstraction
├── server/               # HTTP server (Express)
└── utils/                # Utility functions
```

## Prerequisites

- Node.js 18+ 
- npm
- A Telegram bot token from [@BotFather](https://t.me/botfather)

## Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   VIDEO_PROVIDER=dummy
   VIDEO_API_KEY=your_video_api_key_here
   PORT=3000
   ```

## Usage

### Development Mode

Run the bot in development mode with hot-reload:

```bash
npm run dev
```

### Production Mode

Build and run:

```bash
npm run build
npm start
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from BotFather | Yes | - |
| `VIDEO_PROVIDER` | Video provider to use (`dummy` or `pika`) | No | `dummy` |
| `VIDEO_API_KEY` | API key for video providers | No | - |
| `PORT` | HTTP server port | No | `3000` |

### Switching Video Providers

Set the `VIDEO_PROVIDER` environment variable:

- **Dummy Provider** (for testing):
  ```env
  VIDEO_PROVIDER=dummy
  ```
  This provider simulates video generation and returns a sample video URL.

- **Pika Provider** (requires API key):
  ```env
  VIDEO_PROVIDER=pika
  VIDEO_API_KEY=your_pika_api_key_here
  ```
  Note: The Pika provider is currently a stub with TODOs for actual API integration.

## Telegram Commands

### `/start`

Welcome message and usage instructions.

### `/video <prompt> [duration] [aspect ratio]`

Generate an AI video from a text prompt.

**Examples:**
- `/video cyberpunk shiba inu running through neon Tokyo`
- `/video sunset over mountains, 10 seconds, 16:9`
- `/video dancing robot, 5s, 1:1`

**Parameters:**
- **Prompt** (required): Description of the video you want to generate
- **Duration** (optional): Video length in seconds (e.g., "5s", "10 seconds"). Default: 10 seconds
- **Aspect Ratio** (optional): Video aspect ratio (e.g., "16:9", "9:16", "1:1"). Default: 16:9

## Adding New Video Providers

1. Create a new provider class implementing `IVideoProvider`:
   ```typescript
   import { IVideoProvider, GenerateVideoOptions } from './IVideoProvider';
   
   export class MyVideoProvider implements IVideoProvider {
     async generateVideo(options: GenerateVideoOptions): Promise<string> {
       // Your implementation
     }
   }
   ```

2. Add the provider to the factory in `src/video/index.ts`:
   ```typescript
   case 'myprovider':
     return new MyVideoProvider(apiKey);
   ```

3. Update the `VIDEO_PROVIDER` environment variable to use your new provider.

## Project Structure

```
veo3-telegram-bot/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── config/
│   │   └── env.ts               # Environment configuration
│   ├── bot/
│   │   ├── telegramBot.ts       # Telegram bot initialization
│   │   ├── telegramHandlers.ts  # Command handlers
│   │   └── twitterBotStub.ts   # Twitter/X integration stub
│   ├── video/
│   │   ├── IVideoProvider.ts   # Video provider interface
│   │   ├── DummyVideoProvider.ts # Dummy provider for testing
│   │   ├── PikaVideoProvider.ts # Pika provider stub
│   │   └── index.ts             # Provider factory
│   ├── server/
│   │   └── httpServer.ts        # Express HTTP server
│   └── utils/
│       ├── logger.ts            # Logging utility
│       └── promptParser.ts      # Prompt parsing utility
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Development

### Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application

### Code Quality

- TypeScript strict mode enabled
- Async/await used throughout
- Error handling with try-catch blocks
- Input validation for user prompts

## Future Enhancements

- [ ] Complete Pika API integration
- [ ] Add support for Luma, Runway, and other providers
- [ ] Implement Twitter/X integration
- [ ] Add video generation queue system
- [ ] Implement rate limiting
- [ ] Add user authentication/authorization
- [ ] Webhook support for video provider callbacks

## Troubleshooting

### Bot not responding

1. Verify your `TELEGRAM_BOT_TOKEN` is correct
2. Check that the bot is running: `npm run dev`
3. Check logs for any error messages

### Video generation fails

1. If using `dummy` provider, it should always work
2. If using `pika` provider, ensure `VIDEO_API_KEY` is set correctly
3. Check logs for detailed error messages

### Port already in use

Change the `PORT` environment variable to a different port number.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

