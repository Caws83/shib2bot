# Deployment Guide - Veo3 Telegram Bot

This guide will walk you through setting up and deploying your Telegram bot to Railway.

## Prerequisites

- A Telegram bot token from [@BotFather](https://t.me/botfather)
- A GitHub account
- A Railway account (free tier available)

---

## Step 1: Get Your Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Start a chat and send `/newbot`
3. Follow the prompts to:
   - Choose a name for your bot
   - Choose a username (must end in `bot`, e.g., `my_video_bot`)
4. BotFather will give you a token that looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. **Save this token** - you'll need it in the next steps

---

## Step 2: Set Up Local Environment

1. **Create a `.env` file** in the project root:
   ```bash
   # Copy the example file
   copy .env.example .env
   ```

2. **Edit `.env`** and add your Telegram bot token:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   VIDEO_PROVIDER=dummy
   VIDEO_API_KEY=
   PORT=3000
   ```

3. **Test locally**:
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   [INFO] Environment configuration loaded
   [INFO] HTTP server started on port 3000
   [INFO] Telegram bot started and polling for updates
   ```

4. **Test the bot**:
   - Open Telegram
   - Search for your bot by username
   - Send `/start` - you should get a welcome message
   - Send `/video test video` - bot should respond (using dummy provider)

---

## Step 3: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   ```

2. **Create a `.gitignore`** (already exists, but verify it includes `.env`)

3. **Stage and commit files**:
   ```bash
   git add .
   git commit -m "Initial commit: Veo3 Telegram Bot"
   ```

4. **Create a GitHub repository**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it (e.g., `veo3-telegram-bot`)
   - **Don't** initialize with README (we already have one)
   - Click "Create repository"

5. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/veo3-telegram-bot.git
   git branch -M main
   git push -u origin main
   ```
   
   Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 4: Deploy to Railway

### 4.1 Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended for easy integration)
3. Complete the onboarding

### 4.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `veo3-telegram-bot` repository
4. Railway will automatically detect it's a Node.js project

### 4.3 Configure Environment Variables

1. In your Railway project, go to the **"Variables"** tab
2. Click **"New Variable"** and add each of these:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `TELEGRAM_BOT_TOKEN` | Your bot token from Step 1 | **Required** |
   | `VIDEO_PROVIDER` | `dummy` | For testing, change later |
   | `VIDEO_API_KEY` | (leave empty for now) | Only needed for real providers |
   | `PORT` | `3000` | Railway will override this, but set it anyway |
   | `NODE_ENV` | `production` | Optional but recommended |

3. Railway will automatically redeploy when you add variables

### 4.4 Configure Build Settings

Railway should auto-detect, but verify:

1. Go to **"Settings"** tab
2. Under **"Build Command"**, it should be: `npm run build` (or leave empty)
3. Under **"Start Command"**, it should be: `npm start`
4. Under **"Root Directory"**, leave empty (root is fine)

### 4.5 Deploy

1. Railway will automatically deploy when you:
   - Push to GitHub
   - Add environment variables
   - Or manually trigger from the "Deployments" tab

2. **Watch the logs**:
   - Go to the **"Deployments"** tab
   - Click on the latest deployment
   - View logs to see if it starts successfully

3. **Check for success**:
   You should see in logs:
   ```
   [INFO] Environment configuration loaded
   [INFO] HTTP server started on port 3000
   [INFO] Telegram bot started and polling for updates
   ```

---

## Step 5: Test Your Deployed Bot

1. **Get your bot's public URL** (optional, for health checks):
   - Railway provides a public URL (e.g., `https://your-app.railway.app`)
   - Visit `https://your-app.railway.app/health` - should return `{"status":"ok"}`

2. **Test in Telegram**:
   - Open Telegram
   - Find your bot
   - Send `/start` - should work!
   - Send `/video test video` - should generate a video

---

## Step 6: Monitor and Maintain

### View Logs
- Railway Dashboard → Your Project → "Deployments" → Click deployment → "View Logs"

### Update Bot
1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
4. Railway will automatically redeploy

### Add Custom Domain (Optional)
- Railway Dashboard → Your Project → "Settings" → "Domains"
- Add a custom domain if desired

---

## Troubleshooting

### Bot Not Responding
1. Check Railway logs for errors
2. Verify `TELEGRAM_BOT_TOKEN` is set correctly
3. Make sure the bot is running (check deployment status)

### Build Fails
1. Check build logs in Railway
2. Verify `package.json` has all dependencies
3. Ensure TypeScript compiles: `npm run build` locally

### Environment Variables Not Working
1. Verify variables are set in Railway (not just `.env` locally)
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### Port Issues
- Railway automatically sets `PORT` environment variable
- Your code should use `process.env.PORT` (which it does)
- Don't hardcode port numbers

---

## Next Steps

1. **Switch to Real Video Provider**:
   - When ready, update `VIDEO_PROVIDER` to `pika` (or another)
   - Add `VIDEO_API_KEY` with your provider's API key
   - Update `PikaVideoProvider.ts` with real API endpoints

2. **Add More Features**:
   - Rate limiting
   - User authentication
   - Video generation queue
   - Analytics

3. **Set Up Monitoring**:
   - Railway has built-in metrics
   - Consider adding error tracking (Sentry, etc.)

---

## Cost Estimate

- **Railway Free Tier**: $5/month credit (usually enough for a small bot)
- **Telegram Bot**: Free
- **Total**: ~$0-5/month depending on usage

---

## Support

If you encounter issues:
1. Check Railway logs
2. Check Telegram bot status
3. Verify all environment variables are set
4. Test locally first with `npm run dev`

