#!/bin/bash

# Ollama Performance Optimization Script
# Run this to optimize your Ollama setup for better performance

echo "🚀 Optimizing Ollama for better performance..."

# 1. Stop Ollama if running
echo "Stopping Ollama..."
ollama stop || true

# 2. Configure Ollama for performance
echo "Setting Ollama environment variables..."
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_MAX_QUEUE=512
export OLLAMA_RUNNERS_DIR=/tmp/ollama-runners

# 3. Start Ollama with optimized settings
echo "Starting Ollama with optimizations..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
sleep 3

# 4. Pull a smaller, faster model if not already available
echo "Checking for optimized model..."
if ! ollama list | grep -q "qwen2.5:3b"; then
    echo "Pulling smaller qwen2.5:3b model for faster inference..."
    ollama pull qwen2.5:3b
else
    echo "qwen2.5:3b model already available"
fi

# 5. Pre-load the model
echo "Pre-loading model into memory..."
ollama run qwen2.5:3b --format json "test" > /dev/null 2>&1 || true

echo "✅ Ollama optimization complete!"
echo ""
echo "Performance tips:"
echo "• Use smaller models like qwen2.5:3b for faster responses"
echo "• Keep only 1-2 models loaded at a time"
echo "• Use GPU acceleration if available (NVIDIA/AMD)"
echo "• Consider using llama.cpp with GPU support for even faster inference"
echo ""
echo "To use the optimized setup, update your environment:"
echo "export OLLAMA_MODEL=qwen2.5:3b"
echo "export LOCAL_LLM_MODEL=qwen2.5:3b"

# Keep Ollama running
wait $OLLAMA_PID