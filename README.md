# GPT-UI: AI-Powered Dynamic UI Generation System

A production-ready, AI-driven UI generation system that transforms arbitrary data into beautiful, interactive user interfaces using local LLMs.

## 🏗️ Architecture

This is a monorepo containing:

- **`/apps/web`** - Main web application for UI generation
- **`/apps/admin-dashboard`** - Admin dashboard for system management
- **`/packages/schema`** - Core type definitions and schemas
- **`/packages/cache`** - Multi-layer caching system
- **`/packages/llm-engine`** - Pluggable LLM provider engine
- **`/packages/ui-runtime`** - Generic UI renderer
- **`/configs`** - Configuration files
- **`/docs`** - Documentation

## 🚀 Key Principles

1. **No hardcoded UI logic** - UI is generated purely via AI
2. **All behavior is configurable** - JSON/YAML-driven configuration
3. **Local LLM first** - Ollama support with strict 2GB memory limit
4. **Production scalable** - Clean architecture, no premature optimization
5. **Lightweight & performant** - No unnecessary abstractions
6. **Explainable & inspectable** - Everything is debuggable and overridable

## 🛠️ Quick Start

### Prerequisites

1. **Node.js 18+**
2. **Ollama** installed and running
3. **Git**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gpt-ui

# Install dependencies
npm install

# Build all packages
npm run build
```

### Local Development

```bash
# Start the web application (port 3000)
npm run dev --workspace=apps/web

# Start the admin dashboard (port 3001)
npm run dev --workspace=apps/admin-dashboard
```

### Ollama Setup

```bash
# Install recommended models (under 2GB memory limit)
ollama pull phi3:mini      # ~800MB - Fast, good for demos
ollama pull qwen2.5:3b     # ~1.2GB - Balanced performance

# Optional: Higher quality but may exceed 2GB limit
ollama pull qwen2.5:7b     # ~2.8GB - Higher quality (use with caution)
```

## 🔧 Configuration

The system is configured via YAML files in `/configs`:

- **`default.yaml`** - Default system configuration
- Environment-specific overrides supported

Key configuration areas:
- **LLM providers** - Ollama, OpenAI, Anthropic
- **Memory limits** - Strict 2GB budget enforcement
- **Caching strategy** - TTL, size limits, eviction policy
- **UI themes** - Light/dark mode, density, accessibility
- **Security** - Sandboxing, validation, domain restrictions

## 🎯 Usage

1. **Open the web app** at `http://localhost:3000`
2. **Enter any data** - text, JSON, CSV, or arbitrary content
3. **AI generates UI** - The system decides layout, components, and interactions
4. **Inspect & debug** - Full transparency into AI decision-making

## 📊 Admin Dashboard

Access the admin dashboard at `http://localhost:3001` for:

- **System monitoring** - Cache hit rates, memory usage, uptime
- **LLM management** - Model selection, provider configuration
- **Performance metrics** - Request latency, token usage
- **Configuration** - Hot-reloadable settings

## 🏛️ Architecture Details

### LLM Engine
- **Multi-provider support** - Ollama (primary), OpenAI/Anthropic (optional)
- **Memory enforcement** - Automatic model selection within budget
- **Retry logic** - Exponential backoff with configurable attempts
- **Streaming ready** - Infrastructure for real-time responses

### UI Runtime
- **Schema-driven** - No hardcoded component mappings
- **Generic renderer** - Supports any UI primitive via registry
- **Theme support** - Light/dark mode, accessibility compliance
- **Error boundaries** - Graceful fallbacks for malformed schemas

### Caching Strategy
- **Multi-layer caching** - Prompt hash, data hash, UI schema, model output
- **Deterministic keys** - Consistent caching across restarts
- **Config-aware** - Cache invalidation on configuration changes
- **Size management** - LRU eviction with configurable limits

## 🔍 Debugging & Observability

- **Debug panel** - Inspect AI prompts, responses, and decisions
- **Cache transparency** - Hit/miss ratios, eviction statistics
- **Performance metrics** - Latency, token usage, memory consumption
- **Error logging** - Structured logging with configurable levels

## 🚦 Development

### Adding New UI Primitives

1. Define schema in `@gpt-ui/schema`
2. Implement renderer in `@gpt-ui/ui-runtime`
3. Register component in runtime configuration
4. Update AI prompt to include new primitive

### Adding LLM Providers

1. Implement provider interface in `@gpt-ui/llm-engine`
2. Add configuration schema
3. Update provider registry
4. Add provider-specific error handling

### Testing

```bash
# Run all tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📚 Documentation

- **`/docs/architecture.md`** - System architecture and design decisions
- **`/docs/api.md`** - API reference and integration guide
- **`/docs/configuration.md`** - Configuration options and examples
- **`/docs/deployment.md`** - Production deployment guide

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes following the established patterns
4. **Test** thoroughly with multiple models and data types
5. **Submit** a pull request with detailed description

## 📄 License

MIT License - see LICENSE file for details.

## ⚠️ Important Notes

- **Memory limits are enforced** - System will reject models exceeding 2GB
- **Local-first design** - Ollama is the primary and recommended provider
- **No data interpretation** - AI only decides UI presentation, not data meaning
- **Configuration-driven** - All behavior can be modified without code changes
- **Production-ready** - Designed for reliability and maintainability

---

**Built with ❤️ for the AI-native future of UI development**