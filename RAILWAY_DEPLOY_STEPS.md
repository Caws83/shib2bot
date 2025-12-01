# 🚂 Railway Deployment - Step by Step Guide

## Pre-Deployment Checklist ✅

Your `.env` file is ready:
- ✅ `TELEGRAM_BOT_TOKEN` - Set
- ✅ `VIDEO_PROVIDER=veo3` - Set
- ✅ `VIDEO_API_KEY` - Set
- ✅ `PORT=3000` - Set

---

## Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Choose **"Login with GitHub"** (recommended - easiest)
4. Authorize Railway to access your GitHub account

---

## Step 2: Create New Project

1. Once logged in, click **"New Project"** (big button)
2. Select **"Deploy from GitHub repo"**
3. You'll see a list of your GitHub repositories
4. Find and click on **`veoo3`** (or `veo3-telegram-bot` if that's the name)
5. Railway will start importing your project

---

## Step 3: Wait for Initial Build

1. Railway will automatically detect it's a Node.js project
2. It will start building (you'll see logs)
3. **This will FAIL initially** - that's OK! We need to add environment variables first
4. Wait for the build to complete (even if it fails)

---

## Step 4: Add Environment Variables

1. In your Railway project dashboard, click on the **"Variables"** tab (left sidebar)
2. Click **"+ New Variable"** button
3. Add each variable one by one:

   **Variable 1:**
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: `8436574522:AAHmw0v9hieJw97IkNa-rbmg1m-jsgevY58`
   - Click **"Add"**

   **Variable 2:**
   - Name: `VIDEO_PROVIDER`
   - Value: `veo3`
   - Click **"Add"**

   **Variable 3:**
   - Name: `VIDEO_API_KEY`
   - Value: `veo3_652e1f25564b002c79b70e5f10de51ad68c4298ed44c8a83c87c0c38c8564506`
   - Click **"Add"**

   **Variable 4:**
   - Name: `PORT`
   - Value: `3000`
   - Click **"Add"**

4. **Important:** After adding each variable, Railway will automatically redeploy!

---

## Step 5: Configure Build Settings (Verify)

1. Click on **"Settings"** tab
2. Scroll down to **"Build & Deploy"** section
3. Verify these settings:
   - **Build Command:** Leave empty (or `npm run build` if you want)
   - **Start Command:** `npm start`
   - **Root Directory:** Leave empty (root is fine)
   - **Watch Paths:** Leave empty

---

## Step 6: Monitor Deployment

1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Click **"View Logs"** or the logs will show automatically
4. Watch for these success messages:
   ```
   [INFO] Environment configuration loaded
   [INFO] Using Veo3VideoProvider
   [INFO] HTTP server started on port 3000
   [INFO] Telegram bot started and polling for updates
   [INFO] Bot is ready to receive commands
   ```

5. If you see errors, check:
   - Are all environment variables set correctly?
   - Is the VEO3 API key valid?
   - Check the logs for specific error messages

---

## Step 7: Test Your Live Bot

1. Once deployment is successful, open Telegram
2. Search for **@SHIBA2BOT**
3. Send: `/start`
   - Should get welcome message with ShibArmy branding
4. Send: `/video shiba inu running through neon city`
   - Bot should generate a video using VEO3!

---

## Step 8: Get Your Public URL (Optional)

1. In Railway, go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Railway automatically provides a public URL (e.g., `your-app.railway.app`)
4. You can test the health endpoint: `https://your-app.railway.app/health`
   - Should return: `{"status":"ok"}`

---

## Troubleshooting

### Bot Not Responding?
1. Check Railway logs for errors
2. Verify all environment variables are set
3. Make sure `TELEGRAM_BOT_TOKEN` is correct
4. Check if VEO3 API key is valid

### Build Fails?
1. Check build logs in Railway
2. Make sure `package.json` has all dependencies
3. Verify TypeScript compiles: `npm run build` locally first

### Video Generation Fails?
1. Check VEO3 API key is valid
2. Verify you have credits in VEO3 account
3. Check Railway logs for VEO3 API errors

### Port Issues?
- Railway automatically sets `PORT` - your code already uses `process.env.PORT`
- The `PORT=3000` in variables is just a fallback

---

## Cost Estimate

- **Railway Free Tier:** $5/month credit (usually enough for a small bot)
- **VEO3:** ~$0.10-0.50 per video (you have 100 free credits to start!)
- **Total:** ~$0-5/month depending on usage

---

## Next Steps After Deployment

1. ✅ Test bot in Telegram
2. ✅ Monitor Railway logs
3. ✅ Set up bot logo/description (see `BOT_SETUP.md`)
4. ✅ Share your bot with ShibArmy! 🚀

---

## Quick Reference

**Railway Dashboard:** https://railway.app/dashboard
**Your Project:** Will be at `https://railway.app/project/[your-project-id]`
**Logs:** Always check logs if something isn't working!

Good luck! Your bot is ready to go live! 🎉

