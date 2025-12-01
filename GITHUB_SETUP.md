# GitHub Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `veo3-telegram-bot` (or your preferred name)
   - **Description**: "Production-grade AI video generation bot for Telegram"
   - **Visibility**: Choose **Public** (so others can test it) or **Private**
   - **DO NOT** check "Initialize with README" (we already have one)
   - **DO NOT** add .gitignore or license (we already have them)
4. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/veo3-telegram-bot.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

## Step 3: Verify

1. Go to your repository on GitHub
2. You should see all your files
3. **Verify `.env` is NOT there** (it should be excluded)
4. You should see `.env.example` (the template file)

## Security Checklist ✅

- ✅ `.env` is in `.gitignore` (won't be pushed)
- ✅ `.env.example` is included (template for others)
- ✅ No sensitive tokens in the code
- ✅ README has setup instructions

Your repository is now safe to share!

