#!/bin/bash

# GPT-UI Monorepo Setup Script
# This script helps with manual setup when npm install times out

set -e

echo "🚀 Setting up GPT-UI Monorepo..."

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Please install Node.js 18+"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm not found. Please install npm 7+"; exit 1; }

NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install turbo typescript --save-dev

# Build packages in order
echo "🔨 Building packages..."

echo "Building @gpt-ui/schema..."
cd packages/schema
npm install typescript --save-dev
npm run build

echo "Building @gpt-ui/cache..."
cd ../cache
npm install typescript --save-dev
npm run build

echo "Building @gpt-ui/llm-engine..."
cd ../llm-engine
npm install typescript --save-dev
npm run build

echo "Building @gpt-ui/ui-runtime..."
cd ../ui-runtime
npm install typescript react react-dom @types/react @types/react-dom --save-dev
npm run build

# Build apps
echo "Building web application..."
cd ../../apps/web
npm install next react react-dom
npm install @types/node @types/react @types/react-dom typescript eslint eslint-config-next postcss tailwindcss autoprefixer --save-dev
npm run build

echo "Building admin dashboard..."
cd ../admin-dashboard
npm install next react react-dom
npm install @types/node @types/react @types/react-dom typescript eslint eslint-config-next postcss tailwindcss autoprefixer --save-dev
npm run build

cd ../..

echo "✅ Build completed successfully!"

# Check Ollama
echo "🤖 Checking Ollama..."
if command -v ollama >/dev/null 2>&1; then
    echo "✅ Ollama found"

    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "✅ Ollama is running"

        # Check for recommended models
        if ollama list | grep -q "phi3:mini"; then
            echo "✅ phi3:mini model found"
        else
            echo "⚠️  phi3:mini model not found. Run: ollama pull phi3:mini"
        fi
    else
        echo "⚠️  Ollama not running. Start with: ollama serve"
    fi
else
    echo "❌ Ollama not found. Install from: https://ollama.com/download"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the applications:"
echo "  Web app:        npm run dev:web"
echo "  Admin dashboard: npm run dev:admin"
echo "  Both:           npm run dev:web & npm run dev:admin"
echo ""
echo "Or manually:"
echo "  Web app:        cd apps/web && npm run dev"
echo "  Admin dashboard: cd apps/admin-dashboard && npm run dev"
echo ""
echo "Visit:"
echo "  Web app:        http://localhost:3000"
echo "  Admin dashboard: http://localhost:3001"
echo ""
echo "🧪 Test the system:"
echo "  1. Open http://localhost:3000"
echo "  2. Enter: 'Sales increased 15% this quarter to \$2.5M'"
echo "  3. Click 'Generate UI' - AI should create a card layout"
echo ""
echo "⚠️  Make sure Ollama is running: ollama serve"