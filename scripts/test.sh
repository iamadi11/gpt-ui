#!/bin/bash

# GPT-UI System Test Script
# Verifies that the system is properly set up and working

set -e

echo "🧪 Testing GPT-UI System Setup..."

# Check if Ollama is running
echo "🤖 Checking Ollama..."
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "✅ Ollama is running"

    # Check for models
    if ollama list | grep -q "phi3:mini"; then
        echo "✅ phi3:mini model available"
    else
        echo "⚠️  phi3:mini model not found"
    fi
else
    echo "❌ Ollama not running. Start with: ollama serve"
    exit 1
fi

# Check if web app is running
echo "🌐 Checking web application..."
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Web app is running on port 3000"
else
    echo "❌ Web app not running. Start with: npm run dev:web"
fi

# Check if admin dashboard is running
echo "🎛️  Checking admin dashboard..."
if curl -s http://localhost:3001 >/dev/null 2>&1; then
    echo "✅ Admin dashboard is running on port 3001"
else
    echo "⚠️  Admin dashboard not running. Start with: npm run dev:admin"
fi

# Check package builds
echo "📦 Checking package builds..."
if [ -d "packages/schema/dist" ]; then
    echo "✅ Schema package built"
else
    echo "❌ Schema package not built. Run: npm run build"
fi

if [ -d "packages/cache/dist" ]; then
    echo "✅ Cache package built"
else
    echo "❌ Cache package not built. Run: npm run build"
fi

if [ -d "packages/llm-engine/dist" ]; then
    echo "✅ LLM Engine package built"
else
    echo "❌ LLM Engine package not built. Run: npm run build"
fi

if [ -d "packages/ui-runtime/dist" ]; then
    echo "✅ UI Runtime package built"
else
    echo "❌ UI Runtime package not built. Run: npm run build"
fi

echo ""
echo "🎯 Test Results:"
echo "  - If all ✅, system is ready!"
echo "  - If some ❌, run setup: ./scripts/setup.sh"
echo "  - If some ⚠️, check optional components"
echo ""
echo "🚀 Ready to use GPT-UI!"