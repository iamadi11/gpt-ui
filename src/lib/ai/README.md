# AI Provider Abstraction Layer

This module provides a clean abstraction over different AI providers, making it easy to switch between OpenAI, Anthropic, local LLMs, and mock implementations for testing.

## Overview

The AI abstraction layer consists of:

- **AIProvider Interface**: Defines the contract that all AI providers must implement
- **AIProviderFactory**: Creates AI provider instances based on configuration
- **Provider Implementations**: Concrete implementations for different AI services
- **Configuration System**: Environment-based configuration for easy deployment

## Quick Start

```typescript
import { AIProviderFactory } from '@/lib/ai'

// Get the best available provider (auto-detects from environment)
const { provider, type } = AIProviderFactory.getBestAvailableProvider()

// Use the provider
const intentGraph = await provider.inferIntent("Sales grew 15% this quarter")
const critique = await provider.critiqueIntentGraph(input, intentGraph)
```

## Configuration

### Environment Variables

The system automatically detects available providers from environment variables:

#### OpenAI
```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4  # optional, defaults to gpt-4
```

#### Anthropic
```bash
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-3-sonnet-20240229  # optional, defaults to claude-3-sonnet-20240229
```

#### Local LLM
```bash
LOCAL_LLM_ENDPOINT=http://localhost:11434/api/generate  # Ollama-style endpoint
LOCAL_LLM_MODEL=llama2  # optional
```

#### Explicit Provider Selection
```bash
AI_PROVIDER=openai  # or 'anthropic', 'local-llm', 'mock'
```

### Priority Order

When no explicit provider is selected, the system tries providers in this order:
1. OpenAI (if `OPENAI_API_KEY` exists)
2. Anthropic (if `ANTHROPIC_API_KEY` exists)
3. Local LLM (if `LOCAL_LLM_ENDPOINT` exists)
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

## Future Enhancements

- **Local LLM Support**: The `LocalLLMProvider` is ready for implementation with popular local LLM servers (Ollama, LM Studio, etc.)
- **Provider Switching**: Runtime provider switching for A/B testing
- **Caching**: Response caching to reduce API calls
- **Rate Limiting**: Built-in rate limiting for API providers
- **Fallback Chains**: Automatic fallback to alternative providers on failure