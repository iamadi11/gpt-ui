# Deploying Your GPT-UI to Vercel

Since Ollama cannot run on Vercel, here are the best deployment strategies:

## 🚀 Option 1: Vercel + Cloud LLM (Recommended)

### Step 1: Set Environment Variables
```bash
# For OpenAI (fastest)
OPENAI_API_KEY=your_openai_key
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini

# OR for compatible APIs (cheaper)
CLOUD_LLM_API_KEY=your_api_key
CLOUD_LLM_BASE_URL=https://api.groq.com/openai/v1
CLOUD_LLM_MODEL=llama3-70b-8192
AI_PROVIDER=cloud-llm
```

### Step 2: Update vercel.json for API routes
```json
{
  "functions": {
    "src/app/api/infer-intent/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Step 3: Deploy
```bash
npm run build
vercel --prod
```

## 🏠 Option 2: Hybrid Deployment (Local + Vercel)

Keep Ollama local and deploy UI to Vercel:

### Backend (Local Server)
```typescript
// Create a local API server
import express from 'express'
import { LocalLLMProvider } from './src/lib/ai/providers/local-llm-provider'

const app = express()
app.use(express.json())

app.post('/api/infer-intent', async (req, res) => {
  const provider = new LocalLLMProvider('http://localhost:11434/api/generate')
  const result = await provider.inferIntent(req.body.input)
  res.json(result)
})

app.listen(3001, () => console.log('Local AI server running on port 3001'))
```

### Frontend (Vercel)
Update your API calls to point to your local server or a cloud API.

## ☁️ Option 3: Cloud AI Services

### Popular Alternatives:
- **OpenAI**: Fast, reliable (~$0.002/1k tokens)
- **Anthropic Claude**: Excellent reasoning (~$0.008/1k tokens)
- **Groq**: Fast Llama models (~$0.001/1k tokens)
- **Together AI**: Various open-source models
- **Replicate**: Run Ollama models in cloud

### Groq Example (Fast & Cheap):
```bash
CLOUD_LLM_API_KEY=your_groq_key
CLOUD_LLM_BASE_URL=https://api.groq.com/openai/v1
CLOUD_LLM_MODEL=llama3-8b-8192
```

## 🐳 Option 4: Docker + Cloud Run

Deploy Ollama in a container:

```dockerfile
FROM ollama/ollama:latest

# Pre-load your model
RUN ollama serve & sleep 5 && ollama pull qwen2.5:3b && pkill ollama

EXPOSE 11434
CMD ["ollama", "serve"]
```

Deploy to Google Cloud Run, AWS ECS, or similar.

## 📊 Performance Comparison

| Method | Speed | Cost | Setup Complexity |
|--------|-------|------|------------------|
| Local Ollama | Slowest | Free | Medium |
| OpenAI GPT-4o-mini | Fastest | $$ | Easy |
| Groq Llama | Fast | $ | Easy |
| Cloud Run Ollama | Medium | $$$ | Hard |

## 🔧 Quick Vercel Setup

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Login**: `vercel login`
3. **Add environment variables**: `vercel env add`
4. **Deploy**: `vercel --prod`

## ⚡ Optimization Tips for Vercel

- Use `gpt-4o-mini` for speed
- Set appropriate `maxDuration` in vercel.json
- Enable streaming for better UX
- Use edge functions for global distribution

Would you like me to help you set up any of these deployment options?