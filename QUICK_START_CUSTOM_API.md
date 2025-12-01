# ⚡ Quick Start: Your Own Video API (30 Minutes)

## Simplest Path to Working Bot

### Step 1: Get Hugging Face API Key (2 minutes)

1. Go to: https://huggingface.co
2. Sign up (free!)
3. Go to: https://huggingface.co/settings/tokens
4. Click "New token"
5. Name it: "video-bot"
6. Copy the token

**Free tier is generous!**

---

### Step 2: Deploy API to Railway (5 minutes)

1. **Go to Railway**
   - https://railway.app
   - Click "New Project"

2. **Deploy from GitHub**
   - Select "Deploy from GitHub repo"
   - Choose your `veoo3` repo
   - **Important**: Set root directory to: `video-api-service`

3. **Set Environment Variables**
   - Go to Variables tab
   - Add: `HUGGINGFACE_API_KEY` = your token
   - Add: `PORT` = `3001`

4. **Deploy**
   - Railway auto-deploys
   - Get your URL (e.g., `https://video-api.railway.app`)

---

### Step 3: Connect to Your Bot (2 minutes)

1. **Go to your bot's Railway project**
   - The one with your Telegram bot

2. **Update Variables**
   - Find: `VIDEO_PROVIDER`
   - Change to: `custom`
   - Add new: `CUSTOM_API_URL` = your video API URL from Step 2

3. **Railway redeploys**
   - Bot automatically uses your API!

---

### Step 4: Test! (1 minute)

1. Open Telegram
2. Message @SHIBA2BOT
3. Send: `/video test video`
4. **Should work!** 🎉

---

## What You Get

✅ **Your own API** (full control)
✅ **Low cost** (Hugging Face free tier)
✅ **No API limits** (your infrastructure)
✅ **Works immediately**

---

## Cost

- **Hugging Face**: Free tier (generous limits)
- **Railway**: $5/month credit (usually enough)
- **Total**: **$0-5/month** 🎉

---

## Files Created

- ✅ `video-api-service/` - Your API service
- ✅ `src/video/CustomApiVideoProvider.ts` - Bot integration
- ✅ Ready to deploy!

**Let's deploy it now!** 🚀

