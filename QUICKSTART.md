# 🚀 Quick Start Guide

## ✅ Issue Fixed: npm Workspace Protocol

**Problem:** The `workspace:` protocol wasn't working with your npm version.

**Solution:** Fixed all package.json files to use `file:` paths instead. Now works with any npm version!

## ⚡ Fast Setup (Recommended)

```bash
# Run the automated setup script
./scripts/setup.sh

# Test that everything works
npm run test:system

# Then start the applications
npm run dev:web &
npm run dev:admin &
```

## 🐌 Manual Setup (Alternative)

If the script fails, follow the detailed guide in [`docs/setup.md`](docs/setup.md).

## 🏃‍♂️ Run the Applications

Once setup is complete:

```bash
# Terminal 1: Web application (port 3000)
cd apps/web && npm run dev

# Terminal 2: Admin dashboard (port 3001)
cd apps/admin-dashboard && npm run dev
```

## 📋 Prerequisites Check

- ✅ Node.js 18+
- ✅ npm 7+
- ✅ Ollama installed and running
- ✅ Models pulled: `phi3:mini` (recommended)

## 🔧 Troubleshooting

### Still getting workspace errors?
```bash
# Use Yarn instead of npm
npm install -g yarn
yarn install
yarn build
```

### Ollama issues?
```bash
# Start Ollama
ollama serve

# Pull recommended model
ollama pull phi3:mini

# Check status
ollama list
ollama ps
```

### Memory issues?
- Use `phi3:mini` (800MB) instead of larger models
- Ensure system has 8GB+ RAM available

## 🎯 What You'll Get

- **Web App** (http://localhost:3000): AI-powered UI generation from any input
- **Admin Dashboard** (http://localhost:3001): System monitoring and configuration
- **Local LLM Support**: No API keys required, runs entirely locally
- **Production Architecture**: Modular, scalable, and configurable

## 📖 Documentation

- [Architecture Overview](README.md)
- [Detailed Setup Guide](docs/setup.md)
- [Configuration Reference](configs/default.yaml)

---

**Happy coding! 🤖✨**