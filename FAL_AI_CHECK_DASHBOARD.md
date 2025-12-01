# 🔍 Check Fal.ai Dashboard for Correct Format

## Current Issue
HTTP 422 error - Fal.ai is rejecting our request format.

## What I Just Fixed
✅ Better error logging - will show actual validation errors
✅ Trying `prompt_text` instead of `prompt` (some models use this)
✅ Trying multiple endpoint formats

**Code is pushed - Railway deploying!**

---

## ⚠️ CRITICAL: Check Your Fal.ai Dashboard

The 422 error means the request format is wrong. We need the **exact** format from Fal.ai.

### Step 1: Check Fal.ai Dashboard
1. Go to: https://fal.ai/dashboard
2. Log in with your account
3. Look for **"API"** or **"Documentation"** section
4. Find the video generation model you're using

### Step 2: Check API Documentation
1. Visit: https://fal.ai/models
2. Find: **runway-gen3** or the model you're using
3. Click on it
4. Look for **"API"** or **"Request Format"** section
5. Copy the **exact** request body format

### Step 3: Share the Format
Share with me:
- The exact endpoint path
- The exact request body structure
- Required fields
- Optional fields

**I'll update the code immediately!**

---

## What to Look For

The API docs should show something like:
```json
{
  "prompt": "...",
  "aspect_ratio": "16:9",
  ...
}
```

OR maybe:
```json
{
  "prompt_text": "...",
  "aspect_ratio": "16:9",
  ...
}
```

**We need to know which one Fal.ai actually uses!**

---

## After Deployment

1. Wait for Railway to deploy (2 minutes)
2. Test again: `/video test`
3. Check Railway logs - the new error logging will show **actual** validation errors
4. Share the detailed error from logs
5. Check Fal.ai dashboard for correct format

**The improved error logging will help us see exactly what Fal.ai wants!**

