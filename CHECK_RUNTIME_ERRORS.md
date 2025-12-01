# 🔍 Check Runtime Errors

## ✅ Deployment Successful!
Railway shows: "Deployment successful" ✅

But bot is giving errors in Telegram. We need to check the **runtime logs**.

---

## 🔍 Check Railway Logs

### Step 1: View Runtime Logs
1. In Railway, click **"View logs"** button (on the active deployment)
2. OR go to **"Logs"** tab at the top
3. Look for **RED error messages**

### Step 2: What to Look For
- ❌ `[ERROR]` messages
- ❌ Failed API calls
- ❌ Fal.ai API errors
- ❌ Missing environment variables
- ❌ Connection errors

---

## Common Runtime Errors

### Error 1: Fal.ai API Authentication Failed
**Error:** `401` or `403` status
**Fix:** Check if API key is correct

### Error 2: Fal.ai Endpoint Not Found
**Error:** `404` status
**Fix:** Need to update Fal.ai endpoint

### Error 3: Bot Not Connected
**Error:** Telegram connection issues
**Fix:** Check TELEGRAM_BOT_TOKEN

### Error 4: Missing Variables
**Error:** Environment variable not set
**Fix:** Verify all variables in Railway

---

## What to Do

1. **Click "View logs" in Railway**
2. **Scroll to the bottom** (most recent errors)
3. **Copy the RED error messages**
4. **Share them with me** - I'll fix immediately!

---

## Quick Test

What error message do you see in Telegram?
- Share the exact error message
- This will help me identify the issue faster!

