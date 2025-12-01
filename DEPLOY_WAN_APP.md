# 🚀 Deploy Wan2.1 Text-to-Video App on Fal.ai

## Perfect Solution!

Deploy your own Fal.ai app with **Wan2.1** model - real text-to-video generation!

---

## Step 1: Install Fal.ai CLI

```bash
pip install fal
```

Or if you don't have Python:
- Install Python 3.11+ first
- Then install fal

---

## Step 2: Authenticate

```bash
fal auth login
```

This will open browser to authenticate with your Fal.ai account.

---

## Step 3: Create the App

### Create Directory
```bash
mkdir fal-video-app
cd fal-video-app
```

### Create `wan.py`
Copy the Python code from Fal.ai docs into `wan.py`

### Create `pyproject.toml`
```toml
[project]
name = "wan-demo"
version = "0.1.0"
description = "Wan text-to-video generation demo"
requires-python = ">=3.11"
dependencies = [
    "pydantic>=2.0",
    "fal @ git+https://github.com/fal-ai/fal.git#subdirectory=projects/fal"
]

[tool.fal.apps]
wan = { auth = "shared", ref = "wan.py::Wan", no_scale=true }
```

---

## Step 4: Deploy

```bash
fal deploy wan
```

This will:
- Build your app
- Deploy to Fal.ai
- Give you an endpoint like: `your-username/wan/v2.1/1.3b/text-to-video`

---

## Step 5: Update Your Bot

Once deployed, add to Railway Variables:

```
FAL_CUSTOM_APP_ENDPOINT=your-username/wan/v2.1/1.3b/text-to-video
```

Your bot will automatically use your deployed app!

---

## Cost

- **Fal.ai GPU compute**: Pay per use
- **Much cheaper** than per-video APIs
- **Full control** over the model

---

## Benefits

✅ **Real text-to-video** (Wan2.1 model)
✅ **No image required** (pure text-to-video)
✅ **Your own endpoint** (no limits)
✅ **High quality** (GPU-H100)

---

## Quick Start

1. Install: `pip install fal`
2. Auth: `fal auth login`
3. Create files (copy from docs)
4. Deploy: `fal deploy wan`
5. Add endpoint to Railway
6. **Bot works with real video generation!** 🎉

---

## Need Help?

If you need help with Python setup or deployment, let me know!

**This is the BEST solution for real video generation!** 🚀

