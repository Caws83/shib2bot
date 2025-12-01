# Video API Providers Setup Guide

## Available Providers

### 1. VEO3 (Recommended - Best Quality) ⭐

**Get API Key:**
1. Visit: https://www.veo3gen.co/info/installation
2. Sign up with email (get 100 free credits)
3. Go to Dashboard → API Keys
4. Generate a new API key
5. Copy the key

**Setup in .env:**
```env
VIDEO_PROVIDER=veo3
VIDEO_API_KEY=your_veo3_api_key_here
```

**API Documentation:** https://www.veo3gen.co/info/endpoints

---

### 2. Pika Labs

**Get API Key:**
1. Visit: https://pika.art (or their API portal)
2. Sign up for API access
3. Get your API key from dashboard

**Setup in .env:**
```env
VIDEO_PROVIDER=pika
VIDEO_API_KEY=your_pika_api_key_here
PIKA_API_BASE_URL=https://api.pika.art/v1
```

---

### 3. Runway ML (Gen-3)

**Get API Key:**
1. Visit: https://runwayml.com
2. Sign up for API access
3. Get API key from settings

**Setup in .env:**
```env
VIDEO_PROVIDER=runway
VIDEO_API_KEY=your_runway_api_key_here
```

---

### 4. Luma AI (Dream Machine)

**Get API Key:**
1. Visit: https://lumalabs.ai
2. Sign up for API access
3. Get API key from dashboard

**Setup in .env:**
```env
VIDEO_PROVIDER=luma
VIDEO_API_KEY=your_luma_api_key_here
```

---

## Quick Start with VEO3

1. **Get your API key** from https://www.veo3gen.co/info/installation
2. **Update your .env file:**
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_token
   VIDEO_PROVIDER=veo3
   VIDEO_API_KEY=your_veo3_api_key
   PORT=3000
   ```
3. **Restart your bot:**
   ```bash
   npm run dev
   ```

## Cost Comparison

- **VEO3**: ~$0.10-0.50 per video (varies by length)
- **Pika**: ~$0.05-0.20 per video
- **Runway**: ~$0.05 per second
- **Luma**: Free tier available, then pay-per-use

## Testing

Start with VEO3 - it offers the best quality and easiest setup. You get 100 free credits when you sign up!

