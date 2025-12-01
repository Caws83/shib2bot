# 🚀 Deploy Your Video API to AWS - Step by Step

## Goal
Deploy your own video generation API to AWS for **low cost** and **full control**.

---

## Option 1: AWS Lambda + API Gateway (Serverless - Cheapest!)

### Step 1: Get Hugging Face API Key (Free!)

1. Go to: https://huggingface.co
2. Sign up (free account)
3. Go to: https://huggingface.co/settings/tokens
4. Create new token
5. Copy the token

**Free tier includes generous limits!**

---

### Step 2: Prepare Your Code

The video API service is already created in `video-api-service/` folder!

### Step 3: Deploy to AWS Lambda

#### Option A: Use AWS Console (Easiest)

1. **Go to AWS Lambda Console**
   - Visit: https://console.aws.amazon.com/lambda
   - Click "Create function"

2. **Create Function**
   - Name: `video-generation-api`
   - Runtime: Node.js 20.x
   - Architecture: x86_64
   - Click "Create function"

3. **Upload Code**
   - In Lambda function, go to "Code" tab
   - Click "Upload from" → ".zip file"
   - Create zip of your `video-api-service` folder
   - Upload it

4. **Set Environment Variables**
   - Go to "Configuration" → "Environment variables"
   - Add:
     - `HUGGINGFACE_API_KEY` = your HF token
     - `PORT` = `3001`

5. **Set Handler**
   - Handler: `dist/index.handler` (for serverless-express)
   - OR use Lambda function format

#### Option B: Use Serverless Framework (Recommended)

1. **Install Serverless**
   ```bash
   npm install -g serverless
   ```

2. **Create serverless.yml** in `video-api-service/`
   ```yaml
   service: video-generation-api

   provider:
     name: aws
     runtime: nodejs20.x
     region: us-east-1
     environment:
       HUGGINGFACE_API_KEY: ${env:HUGGINGFACE_API_KEY}
       PORT: 3001

   functions:
     api:
       handler: dist/index.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
         - http:
             path: /
             method: ANY
       timeout: 300
       memorySize: 512
   ```

3. **Deploy**
   ```bash
   cd video-api-service
   npm install
   npm run build
   serverless deploy
   ```

---

### Step 4: Get Your API URL

After deployment, you'll get a URL like:
```
https://abc123.execute-api.us-east-1.amazonaws.com/dev
```

---

### Step 5: Connect to Your Bot

In Railway (your bot):
1. Go to Variables
2. Add: `VIDEO_PROVIDER=custom`
3. Add: `CUSTOM_API_URL=https://your-lambda-url.execute-api.us-east-1.amazonaws.com/dev`
4. Railway redeploys
5. **Bot works!** 🎉

---

## Option 2: AWS EC2 (More Control)

### Step 1: Launch EC2 Instance

1. Go to: https://console.aws.amazon.com/ec2
2. Click "Launch Instance"
3. Choose:
   - **AMI**: Ubuntu 22.04 LTS
   - **Instance Type**: t3.micro (free tier) or t3.small
   - **Storage**: 20GB
4. Click "Launch"

### Step 2: Connect to EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 4: Deploy Your API

```bash
# Clone your repo or upload files
git clone https://github.com/Caws83/veoo3.git
cd veoo3/video-api-service

# Install dependencies
npm install

# Build
npm run build

# Set environment variables
export HUGGINGFACE_API_KEY=your_key_here
export PORT=3001

# Start with PM2 (keeps it running)
sudo npm install -g pm2
pm2 start dist/index.js --name video-api
pm2 save
pm2 startup
```

### Step 5: Configure Security Group

1. In EC2 Console → Security Groups
2. Add inbound rule:
   - Type: HTTP
   - Port: 80
   - Source: 0.0.0.0/0

### Step 6: Get Your URL

Your API will be at: `http://your-ec2-ip:3001`

---

## Option 3: Railway (Easiest - Same Platform!)

### Step 1: Create New Railway Service

1. Go to Railway
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repo
5. Set root directory: `video-api-service`

### Step 2: Set Environment Variables

1. Go to Variables tab
2. Add:
   - `HUGGINGFACE_API_KEY` = your HF token
   - `PORT` = `3001`

### Step 3: Deploy

Railway auto-deploys! Get your URL.

### Step 4: Connect to Bot

Same as above - add `CUSTOM_API_URL` to bot's Railway variables.

---

## Cost Comparison

### AWS Lambda (Serverless)
- **Free tier**: 1M requests/month free
- **After free tier**: $0.20 per 1M requests
- **Compute**: Pay per execution time
- **Total**: ~$0-5/month for small usage

### AWS EC2
- **t3.micro**: Free tier (750 hours/month)
- **t3.small**: ~$15/month
- **Total**: $0-15/month

### Railway
- **Free tier**: $5 credit/month
- **Hobby plan**: $5/month
- **Total**: $0-5/month

---

## Recommended: Start with Railway!

**Easiest and cheapest to start:**
1. Deploy video API to Railway (5 minutes)
2. Get URL
3. Connect to bot
4. **Works immediately!**

Then migrate to AWS later if needed.

---

## Next Steps

1. **Get Hugging Face API key** (free!)
2. **Choose deployment option** (Railway easiest)
3. **Deploy the API**
4. **Connect to bot**
5. **Test!**

**I'll help you with each step!** 🚀

