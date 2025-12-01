# 📋 Step-by-Step: Deploy Your Own Video API

## Complete Guide - Follow These Steps

---

## Part 1: Get Hugging Face API Key (5 minutes)

### Step 1.1: Sign Up
1. Go to: https://huggingface.co
2. Click "Sign Up" (top right)
3. Create account (free!)

### Step 1.2: Get API Token
1. After signing up, go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Name it: `video-bot-api`
4. Select "Read" permission (enough for inference)
5. Click "Generate token"
6. **COPY THE TOKEN** - you'll need it!

✅ **Done!** You now have a free Hugging Face API key.

---

## Part 2: Deploy Video API to Railway (10 minutes)

### Step 2.1: Go to Railway
1. Go to: https://railway.app
2. Sign in (or sign up if needed)

### Step 2.2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `veoo3` repository
4. Click "Deploy"

### Step 2.3: Configure Service
1. Railway will detect your repo
2. **IMPORTANT**: Click on the service
3. Go to "Settings" tab
4. Find "Root Directory"
5. Set it to: `video-api-service`
6. Click "Save"

### Step 2.4: Set Environment Variables
1. Go to "Variables" tab
2. Click "New Variable"
3. Add:
   - **Name**: `HUGGINGFACE_API_KEY`
   - **Value**: (paste your token from Part 1)
4. Click "Add"
5. Add another:
   - **Name**: `PORT`
   - **Value**: `3001`
6. Click "Add"

### Step 2.5: Deploy
1. Railway will automatically deploy
2. Wait for deployment to complete (2-3 minutes)
3. Go to "Settings" tab
4. Find "Generate Domain"
5. Click it to get your public URL
6. **COPY THE URL** (e.g., `https://video-api-production.up.railway.app`)

✅ **Done!** Your video API is live!

---

## Part 3: Connect Bot to Your API (5 minutes)

### Step 3.1: Go to Your Bot's Railway Project
1. In Railway, find your Telegram bot project
2. Click on it

### Step 3.2: Update Environment Variables
1. Go to "Variables" tab
2. Find `VIDEO_PROVIDER`
3. Change value to: `custom`
4. Click "Update"
5. Add new variable:
   - **Name**: `CUSTOM_API_URL`
   - **Value**: (paste your video API URL from Part 2)
6. Click "Add"

### Step 3.3: Redeploy
1. Railway will automatically redeploy your bot
2. Wait for deployment (1-2 minutes)
3. Check logs to confirm it's using `CustomApiVideoProvider`

✅ **Done!** Your bot is connected!

---

## Part 4: Test Your Bot (2 minutes)

### Step 4.1: Open Telegram
1. Open Telegram app
2. Find your bot (e.g., @SHIBA2BOT)

### Step 4.2: Test Commands
1. Send: `/start`
   - Should show welcome message

2. Send: `/video test video generation`
   - Bot should respond: "Generating your video..."
   - Wait 30-60 seconds
   - Should receive a video!

✅ **Success!** Your bot is working!

---

## Troubleshooting

### Bot says "Error generating video"
1. Check Railway logs for your video API
2. Make sure `HUGGINGFACE_API_KEY` is set correctly
3. Check that `CUSTOM_API_URL` points to your video API

### Video API returns 503
- Hugging Face models sometimes need to "warm up"
- Wait 30 seconds and try again
- First request may take longer

### No video received
- Check Railway logs for both services
- Verify API URL is correct
- Make sure video API is deployed and running

---

## Cost Breakdown

- **Hugging Face**: Free tier (generous!)
- **Railway**: $5/month credit (usually enough)
- **Total**: **$0-5/month** 🎉

---

## What You Built

✅ Your own video generation API
✅ Deployed to Railway
✅ Connected to Telegram bot
✅ Low cost solution
✅ Full control!

---

## Next Steps (Optional)

1. **Monitor usage** in Railway dashboard
2. **Add more models** to video API
3. **Optimize for speed** (caching, etc.)
4. **Scale up** if needed (Railway auto-scales)

---

## Need Help?

If you get stuck at any step, let me know which step and I'll help!

**You've got this!** 🚀

