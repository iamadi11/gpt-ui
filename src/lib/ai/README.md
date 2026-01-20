# AI Provider Abstraction Layer

This module provides a clean abstraction over different AI providers, making it easy to switch between OpenAI, Anthropic, local LLMs (Ollama), and mock implementations for testing.

## 🚀 Quick Setup for Local AI (Recommended)

For the **True Dynamic UI POC**, we recommend using Ollama with a local model for cost-free, offline operation:

### 1. Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai/download)

### 2. Start Ollama Service

```bash
# Start Ollama in the background
ollama serve
```

### 3. Pull the Recommended Model

```bash
# Pull the primary model (recommended)
ollama pull qwen2.5:7b-instruct

# Alternative models (if you have limited RAM):
ollama pull phi3:mini
# or
ollama pull llama3.1:8b-instruct
```

### 4. Test Your Setup

```bash
# Verify the model is available
curl http://localhost:11434/api/tags

# Test a simple generation
curl -X POST http://localhost:11434/api/generate -d '{"model": "qwen2.5:7b-instruct", "prompt": "Hello!"}'
```

### 5. Run Your Next.js App

The system will **automatically detect** and use Ollama if available:

```bash
npm run dev
```

No environment variables needed! The system prioritizes local AI for cost-free operation.

## Overview

The AI abstraction layer consists of:

- **AIProvider Interface**: Defines the contract that all AI providers must implement
- **AIProviderFactory**: Creates AI provider instances based on configuration
- **Provider Implementations**: Concrete implementations for different AI services
- **Configuration System**: Environment-based configuration for easy deployment

## Quick Start (Programmatic)

```typescript
import { AIProviderFactory } from '@/lib/ai'

// Get the best available provider (auto-detects from environment)
// Prioritizes Ollama for local, cost-free operation
const { provider, type } = await AIProviderFactory.getBestAvailableProvider()

// Use the provider
const intentGraph = await provider.inferIntent("Sales grew 15% this quarter")
const critique = await provider.critiqueIntentGraph(input, intentGraph)
```

## Configuration

### Environment Variables

The system automatically detects available providers from environment variables:

#### Local LLM (Ollama - Recommended)
```bash
# No env vars needed! Auto-detects http://localhost:11434/api/generate
# Override with:
LOCAL_LLM_ENDPOINT=http://localhost:11434/api/generate
OLLAMA_MODEL=qwen2.5:7b-instruct  # or phi3:mini for low RAM
```

#### OpenAI (Cloud)
```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4  # optional, defaults to gpt-4
```

#### Anthropic (Cloud)
```bash
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-3-sonnet-20240229  # optional
```

#### Explicit Provider Selection
```bash
AI_PROVIDER=local-llm  # or 'openai', 'anthropic', 'mock'
```

### Priority Order

When no explicit provider is selected, the system tries providers in this order:
1. **Local LLM (Ollama)** - Cost-free, offline (recommended for POC)
2. OpenAI (if `OPENAI_API_KEY` exists)
3. Anthropic (if `ANTHROPIC_API_KEY` exists)
4. Mock (fallback)

## Provider Interface

All AI providers implement this interface:

```typescript
interface AIProvider {
  inferIntent(input: string): Promise<IntentGraph>
  critiqueIntentGraph(input: string, intentGraph: IntentGraph): Promise<AICritiqueResponse>
  modifyIntentGraph(modification: IntentGraphModification): Promise<{...}>
  getModelName(): string
  isAvailable(): boolean
}
```

## Adding a New Provider

1. Implement the `AIProvider` interface
2. Add your provider type to `AIProviderType` enum
3. Update `AIProviderFactory.createProvider()`
4. Add configuration validation in `config.ts`

## Migration from Previous Implementation

The API route has been updated to use the abstracted providers. The behavior remains backward compatible:

- Environment variable detection works the same
- Mock implementation is still used by default
- API responses maintain the same structure

## Testing

Use the mock provider for testing:

```typescript
import { MockProvider } from '@/lib/ai'

const provider = new MockProvider()
// All methods work without external dependencies
```

## Example Usage

### API Request/Response

**Request:**
```bash
curl -X POST http://localhost:3000/api/infer-intent \
  -H "Content-Type: application/json" \
  -d '{"input": "Sales grew 15% to $2.5M this quarter, up from $2.1M last quarter"}'
```

**Response:**
```json
{
  "intentGraph": {
    "overview": {
      "goal": "summarize",
      "confidence": 0.95,
      "description": "Key metrics summary"
    },
    "trend": {
      "goal": "detect_trend",
      "confidence": 0.88,
      "description": "Growth pattern over time"
    },
    "chart": {
      "goal": "visualize",
      "confidence": 0.75,
      "description": "Visual representation of growth"
    }
  },
  "rawInput": "Sales grew 15% to $2.5M this quarter, up from $2.1M last quarter",
  "processingTime": 1250,
  "modelUsed": "qwen2.5:7b-instruct",
  "fallbackUsed": false
}
```

### AI Prompt Engineering

The system uses carefully crafted prompts optimized for small local models. Here's what the AI sees:

**Input Processing:**
```
You are a junior product designer and data analyst tasked with understanding user input...

CRITICAL CONSTRAINTS:
- You MUST NOT trust field names or assume schemas
- You MUST NOT use hardcoded if/else rules
- You MUST base decisions purely on content analysis and user intent

Input: "Sales grew 15% to $2.5M this quarter, up from $2.1M last quarter"
```

**AI Response (JSON only):**
```json
{
  "intentGraph": {
    "overview": {
      "goal": "summarize",
      "confidence": 0.95
    },
    "trend": {
      "goal": "detect_trend",
      "confidence": 0.88
    }
  }
}
```

### Debugging Logs

In development mode, the system logs:
- Raw user input
- AI prompt sent to model
- Raw AI response
- Parsed intent graph
- Processing time and model used

## Architecture Notes

### Philosophy
- **Intelligence over determinism**: AI makes creative UI decisions, not rule-based systems
- **Explainability over correctness**: Confidence scores show AI uncertainty
- **Graceful degradation over strict validation**: Soft JSON parsing, fallback to raw view

### Technical Decisions
- **Local-first**: Ollama prioritized for cost-free, offline operation
- **Schema-light**: No strict JSON schemas - AI decides structure
- **Soft parsing**: Extracts JSON from natural language responses
- **Fallback chains**: Multiple providers tried automatically
- **Minimal abstraction**: `lib/llm.ts` is a thin wrapper over Ollama API

## Future Enhancements

- **Model switching**: Runtime model selection for different tasks
- **Fine-tuning**: Custom models trained on UI design patterns
- **Caching**: Response caching to reduce inference time
- **Streaming**: Real-time UI updates as AI generates intent graph
- **Multi-model consensus**: Multiple models voting on UI decisions