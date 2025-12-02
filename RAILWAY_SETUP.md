# Railway Setup - SHIB2BOT

## Quick Fix: Use Dummy Provider (Free, No API Keys)

Your Railway bot is currently trying to use Fal.ai but your account has no credits.

### Option 1: Use Dummy Provider (Recommended for Testing)

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Variables** tab
4. Add/Update this environment variable:
   ```
   VIDEO_PROVIDER=dummy
   ```
5. Remove or leave empty: `VIDEO_API_KEY` (not needed for dummy)
6. Redeploy your service

The bot will now return sample videos for free - no API keys needed!

### Option 2: Keep Fal.ai but Auto-Fallback to Dummy

The code now automatically falls back to dummy provider if Fal.ai fails (no credits).

Just set:
```
VIDEO_PROVIDER=falai
VIDEO_API_KEY=your_fal_ai_key
```

If Fal.ai fails due to no credits, it will automatically use dummy provider.

## Current Status

- ✅ All Python code deleted
- ✅ Bot defaults to dummy provider if VIDEO_PROVIDER not set
- ✅ Auto-fallback to dummy if Fal.ai has no credits
- ✅ Ready for Railway deployment

## Test It

After setting `VIDEO_PROVIDER=dummy` on Railway:
1. Redeploy
2. Test in Telegram: `/video test`
3. You should get a sample video (no errors!)

