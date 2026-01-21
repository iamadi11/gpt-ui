# Setup Guide for GPT-UI Monorepo

## Prerequisites

- **Node.js 18+**
- **npm 7+** (for workspace support)
- **Ollama** installed and running
- **Git**

## Manual Setup (Due to Network Issues)

Since automated installation is timing out, follow these manual steps:

### 1. Install Dependencies Manually

First, install the root dependencies:
```bash
npm install turbo typescript --save-dev
```

Then install each package's dependencies individually:

```bash
# Schema package (no dependencies)
cd packages/schema
npm install typescript --save-dev

# Cache package
cd ../cache
npm install typescript --save-dev

# LLM Engine package
cd ../llm-engine
npm install typescript --save-dev

# UI Runtime package
cd ../ui-runtime
npm install typescript react react-dom --save-dev
npm install @types/react @types/react-dom --save-dev

# Web app
cd ../../apps/web
npm install next react react-dom
npm install @types/node @types/react @types/react-dom typescript eslint eslint-config-next postcss tailwindcss autoprefixer --save-dev

# Admin dashboard
cd ../admin-dashboard
npm install next react react-dom
npm install @types/node @types/react @types/react-dom typescript eslint eslint-config-next postcss tailwindcss autoprefixer --save-dev
```

### 2. Build Packages in Order

Build packages in dependency order:

```bash
# Build schema first (no dependencies)
cd packages/schema
npm run build

# Build cache (depends on schema)
cd ../cache
npm run build

# Build llm-engine (depends on schema)
cd ../llm-engine
npm run build

# Build ui-runtime (depends on schema)
cd ../ui-runtime
npm run build

# Now build apps (depend on all packages)
cd ../../apps/web
npm run build

cd ../admin-dashboard
npm run build
```

### 3. Setup Ollama

Install and start Ollama:

```bash
# Install Ollama (macOS with Homebrew)
brew install ollama

# Start Ollama service
ollama serve

# In another terminal, pull models
ollama pull phi3:mini      # ~800MB - Fast, recommended
ollama pull qwen2.5:3b     # ~1.2GB - Balanced performance
```

### 4. Run the Applications

```bash
# Terminal 1: Web application (port 3000)
cd apps/web
npm run dev

# Terminal 2: Admin dashboard (port 3001)
cd ../admin-dashboard
npm run dev
```

## Alternative: Using Yarn (Recommended)

If npm continues to have issues, use Yarn which has better workspace support:

```bash
# Install Yarn
npm install -g yarn

# Install all dependencies
yarn install

# Build all packages
yarn build

# Run applications
yarn dev:web      # Web app on port 3000
yarn dev:admin    # Admin on port 3001
```

## Troubleshooting

### Common Issues

1. **"Cannot find module '@gpt-ui/..."**
   - Ensure packages are built in the correct order
   - Check that `packages/*/dist` directories exist

2. **Ollama connection errors**
   - Ensure Ollama is running: `ollama serve`
   - Check model is installed: `ollama list`
   - Verify endpoint in config

3. **Memory errors**
   - Reduce context window in LLM config
   - Use smaller models (phi3:mini recommended)
   - Monitor with `ollama ps`

4. **TypeScript errors**
   - Ensure all packages are built: `npm run build`
   - Check import paths in tsconfig.json files

### Development Workflow

```bash
# Build all packages
npm run build

# Run both apps in development
npm run dev:web &
npm run dev:admin &

# Watch mode for packages
cd packages/schema && npm run dev
cd packages/cache && npm run dev
# etc.
```

### Environment Variables

Create `.env.local` files in each app directory if needed:

```bash
# apps/web/.env.local
OLLAMA_ENDPOINT=http://localhost:11434/api/generate

# apps/admin-dashboard/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Architecture Overview

The system consists of:

- **@gpt-ui/schema**: Core types and interfaces
- **@gpt-ui/cache**: Multi-layer caching system
- **@gpt-ui/llm-engine**: LLM provider abstraction
- **@gpt-ui/ui-runtime**: Generic UI renderer
- **apps/web**: Main application (port 3000)
- **apps/admin-dashboard**: Admin panel (port 3001)

## Memory Requirements

- **phi3:mini**: ~800MB RAM (recommended)
- **qwen2.5:3b**: ~1.2GB RAM (balanced)
- **qwen2.5:7b**: ~2.8GB RAM (high quality, may exceed 2GB limit)

Total system memory should be 8GB+ for comfortable operation.