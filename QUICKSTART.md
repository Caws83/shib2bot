# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Get Your Telegram Bot Token

1. Open Telegram
2. Search for **[@BotFather](https://t.me/botfather)**
3. Send `/newbot`
4. Follow instructions to create your bot
5. **Copy the token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Create `.env` File

In the project root, create a file named `.env` with this content:

```env
TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE
VIDEO_PROVIDER=dummy
VIDEO_API_KEY=
PORT=3000
```

**Replace `YOUR_TOKEN_HERE` with the token from Step 1.**

### Step 3: Run the Bot

```bash
npm run dev
```

You should see:
```
[INFO] Environment configuration loaded
[INFO] HTTP server started on port 3000
[INFO] Telegram bot started and polling for updates
```

### Step 4: Test in Telegram

1. Open Telegram
2. Search for your bot (the username you created)
3. Send `/start`
4. Send `/video test video`

**That's it!** Your bot is running locally. 

For deployment to Railway, see [DEPLOYMENT.md](./DEPLOYMENT.md).

