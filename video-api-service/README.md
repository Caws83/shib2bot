# Video Generation API Service

Simple, low-cost video generation API using Hugging Face Inference API.

## Quick Start

1. **Get Hugging Face API Key**
   - Sign up at https://huggingface.co (free!)
   - Get token at https://huggingface.co/settings/tokens

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your HUGGINGFACE_API_KEY
   ```

3. **Install & Run**
   ```bash
   npm install
   npm run dev
   ```

4. **Test**
   ```bash
   curl -X POST http://localhost:3001/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt": "a cat walking"}'
   ```

## Deploy to Railway

1. Create new Railway project
2. Connect GitHub repo
3. Set root directory: `video-api-service`
4. Add environment variable: `HUGGINGFACE_API_KEY`
5. Deploy!

## Deploy to AWS Lambda

See `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions.

## API Endpoints

- `GET /health` - Health check
- `POST /generate` - Generate video
  ```json
  {
    "prompt": "your video description",
    "duration": 10,
    "aspect_ratio": "16:9"
  }
  ```

## Cost

- **Hugging Face**: Free tier (generous limits)
- **Hosting**: Railway ($5/month) or AWS Lambda (pay per use)
- **Total**: $0-5/month for small usage

