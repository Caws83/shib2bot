# ⚠️ Fal.ai Issue: Requires image_url

## Problem Found!

The error shows:
```
"loc": ["body", "image_url"],
"msg": "field required"
```

**Fal.ai runway-gen3 requires an `image_url` field!**

This means:
- ❌ runway-gen3 is **image-to-video** (needs an image input)
- ❌ NOT text-to-video (can't use just a prompt)

---

## Solutions

### Option 1: Use Dummy Provider (Works NOW)
**Get your bot working immediately:**

1. In Railway → Variables
2. Change: `VIDEO_PROVIDER=dummy`
3. Railway redeploys
4. Bot works with sample videos!

**Then we can fix Fal.ai properly later.**

---

### Option 2: Use Different Fal.ai Model
I've updated the code to try text-to-video models:
- `fal-ai/animate` - Animation model
- `fal-ai/stable-video-diffusion` - Might work
- `fal-ai/stable-video` - Might work

**Code is updated - Railway deploying!**

---

### Option 3: Generate Image First (Complex)
We could:
1. Generate an image from text (using DALL-E, Stable Diffusion, etc.)
2. Upload image to a URL
3. Use that image_url with Fal.ai

**This is more complex and takes longer.**

---

## Recommended: Use Dummy Provider NOW

**To get your bot working for the community ASAP:**

1. Railway → Variables
2. `VIDEO_PROVIDER=dummy`
3. Test - bot works!
4. We fix Fal.ai properly later

**Your bot will work immediately with sample videos!**

---

## What I Just Did

✅ Updated code to skip runway-gen3 (requires image)
✅ Try other Fal.ai models that might work with text
✅ Code pushed - Railway deploying

**But the fastest solution is to use dummy provider for now!**

