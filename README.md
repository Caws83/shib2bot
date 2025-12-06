# SHIB2BOT - Full Stack AI Video Generation Platform

Production-ready AI video generation platform with Telegram bot, admin panel, credit system, and AWS video inference integration.

## 🏗️ Architecture

- **Backend (Railway)**: Node.js + TypeScript + Express + Prisma + PostgreSQL
- **Database (Railway)**: PostgreSQL (Railway managed)
- **Telegram Bot**: Telegraf
- **Admin Panel (Railway)**: Next.js + React + TailwindCSS
- **Video Engine (AWS)**: External GPU inference server (called via HTTP)
- **Payments**: Crypto (NOWPayments/Coinbase Commerce)

**Deployment**: Everything runs on Railway except the GPU inference server (AWS).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Telegram bot token from [@BotFather](https://t.me/botfather)

### Installation

```bash
# Install dependencies
npm install
cd admin-panel && npm install && cd ..

# Set up database
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed admin user
npm run prisma:seed

# Start backend
npm run dev

# Start admin panel (separate terminal)
cd admin-panel && npm run dev
```

## 📱 Telegram Bot Commands

- `/start` - Welcome message with dashboard button
- `/video <prompt>` - Generate a video (costs 10 credits)
- `/credits` - Check your credit balance
- `/buy` - Purchase credits with crypto
- `/dashboard` - Open Mini App dashboard
- `/adminpanel` - Open admin Mini App (admins only)

## 🔌 API Endpoints

### Public API
- `POST /api/v1/video/generate` - Generate video
- `GET /api/v1/video/job/:jobId` - Get job status
- `GET /api/v1/me/credits` - Get credit balance

### Authentication
- `POST /auth/telegram-webapp` - Authenticate Telegram Mini App

### Mini API (JWT auth)
- `GET /mini-api/me` - Get user profile
- `GET /mini-api/me/jobs` - Get user's jobs
- `POST /mini-api/payments/create-invoice` - Create payment invoice

## 🎬 Video Engine

Uses your own inference API (AWS or any HTTP-based service). Configure via environment variables:

- `VIDEO_ENGINE_BASE_URL` - Your inference server URL
- `VIDEO_ENGINE_API_KEY` - API key for authentication

The engine should accept `POST /generate-video` with `{ prompt, durationSeconds, modelName }` and return `{ jobId, status, videoUrl?, error? }`.

**Note**: Backend is platform-agnostic - just makes HTTP requests. No AWS SDK dependencies. Works with any inference server. For development, engine is mocked.

## 💳 Credits & Payments

- Each video generation costs **10 credits**
- Credits can be purchased via crypto payments
- Payment packages: Starter ($10 = 100 credits), Pro ($25 = 300 credits), Enterprise ($50 = 700 credits)

## 📊 Admin Panel

Access at `http://localhost:3001/admin/dashboard` or via Telegram Mini App.

Features: View users, manage credits, monitor jobs, process payments.

## 📦 Deployment

### Railway

1. Create Railway project and add PostgreSQL
2. Deploy from GitHub: `Caws83/shib2bot`
3. Set environment variables (see `RAILWAY_DEPLOYMENT.md`)
4. Run migrations: `railway run npm run prisma:migrate`
5. Seed admin: `railway run npm run prisma:seed`

See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

### Environment Variables

See `.env.example` for all variables.

**Required:**
- `DATABASE_URL` (Railway provides automatically)
- `TELEGRAM_BOT_TOKEN`
- `JWT_SECRET`
- `FRONTEND_URL`
- `BACKEND_URL`

**Optional:**
- `VIDEO_ENGINE_BASE_URL` (AWS server - leave empty for mock)
- `VIDEO_ENGINE_API_KEY`

## 🗄️ Database Models

- **User** - Telegram users with credits and roles
- **Job** - Video generation jobs
- **Chat** - Telegram chats with limits
- **ApiKey** - API keys for programmatic access
- **PaymentInvoice** - Crypto payment invoices
- **UsageRecord** - Credit usage tracking

## 📝 License

MIT
