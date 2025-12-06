# Railway Deployment Guide

## Quick Setup

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select: `Caws83/shib2bot`

2. **Add PostgreSQL**
   - Click "+ New" → Database → PostgreSQL
   - Railway auto-provides `DATABASE_URL`

3. **Set Environment Variables**
   - Go to your service → Variables tab
   - Add all variables from `.env.example`
   - Use `DATABASE_URL=${{Postgres.DATABASE_URL}}` for database

4. **Deploy**
   - Railway auto-detects Node.js
   - Build: `npm run build`
   - Start: `npm start`

5. **Run Migrations**
   ```bash
   railway run npm run prisma:migrate
   railway run npm run prisma:seed
   ```

## Environment Variables

### Required
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `TELEGRAM_BOT_TOKEN` - From @BotFather
- `JWT_SECRET` - Random 32+ char string
- `PORT=3000`
- `NODE_ENV=production`
- `FRONTEND_URL` - Your admin panel URL
- `BACKEND_URL` - Your backend URL
- `ADMIN_TELEGRAM_ID` - Your Telegram user ID

### Optional
- `VIDEO_ENGINE_BASE_URL` - AWS inference server (leave empty for mock)
- `VIDEO_ENGINE_API_KEY` - AWS API key
- `NOWPAYMENTS_API_KEY` - Crypto payments
- `COINBASE_COMMERCE_API_KEY` - Crypto payments

## Architecture

- **Railway**: Backend + Database + Admin Panel
- **AWS**: GPU inference server (separate, called via HTTP)

## Verify Deployment

1. Health check: `https://your-app.railway.app/health`
2. Test bot: Send `/start` to your Telegram bot
3. Check logs: Railway Dashboard → Deployments → Logs
