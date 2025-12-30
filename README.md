# SourceLens

**Enhanced search results panel for AI chat interfaces**

SourceLens transforms AI chat search results into a visual, Google-like results panel. It extracts sources from assistant messages and presents them in an organized, interactive overlay—all while keeping your data completely private and local.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-blue)](https://chrome.google.com/webstore) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

### 🎯 Visual Results Panel
- Organized card layout with favicons, titles, domains, and snippets
- Grouped by domain or flat list view
- Smart ranking for top results (domain diversity, quality signals)

### 👁️ Preview Mode
- Split-panel preview with secure sandboxed iframe
- Graceful fallback for sites that block embedding (X-Frame-Options)
- Quick actions when preview is unavailable

### 📌 Pinboard & Collections
- Save important sources to folders
- Search and filter your pins
- Export as JSON or Markdown
- "Seen again" indicators

### 🧠 Knowledge Panel (V3.1)
- Query context (in-memory, never saved)
- Top domains with diversity scores
- Source quality signals (docs-heavy, news-heavy, forum-heavy)
- Date hints and freshness indicators
- Suggested pins

### 🎨 Intent-Based Filtering
- Filter by category: Docs, News, Video, Forums, Shopping, Research
- Quick filtering with visual chips

### 🕒 Session History
- Privacy-preserving session tracking
- View recent search sessions with domain counts
- Completely optional (can be disabled)

### ⌨️ Command Palette
- Press `Cmd/Ctrl+K` for quick actions
- Keyboard-driven navigation

### 🔒 Privacy First
- **No data collection** - Zero analytics or telemetry
- **No chat text storage** - We never save your prompts or responses
- **Local-only processing** - Everything happens in your browser
- **Minimal permissions** - Only storage and ChatGPT domain access

## 📦 Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Click "Add to Chrome"
3. Start using SourceLens on chatgpt.com or chat.openai.com

### Load Unpacked (Development)
1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd gpt-ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate icons:**
   ```bash
   npm run generate-icons
   ```

4. **Build the extension:**
   ```bash
   npm run build
   ```

5. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist/` folder

## 🚀 Usage

1. **Open ChatGPT** - Visit chatgpt.com or chat.openai.com

2. **Trigger Search Results** - Ask a question that generates sources

3. **Open Panel** - Click the toggle button (🔍) or press `Cmd/Ctrl+Shift+E`

4. **Explore Features:**
   - Browse results in organized cards
   - Click "Preview" to view content in split mode
   - Pin important sources for later
   - Filter by intent (Docs, News, Video, etc.)
   - View knowledge panel insights
   - Export results or pins

### Keyboard Shortcuts

- `Cmd/Ctrl+Shift+E` - Toggle results panel
- `Cmd/Ctrl+Shift+H` - Toggle highlight sources in chat
- `Cmd/Ctrl+K` - Open command palette
- `Escape` - Close modals/palette

### Settings

Access settings via the ⚙️ icon in the panel header:

- **Panel Position** - Right or Left (desktop)
- **Default Tab** - Results, Pins, or History
- **Default View** - Top Results, All Results, or Grouped
- **Auto-open preview** - Auto-open preview in split mode
- **Enable top ranking** - Use smart ranking for top results
- **Privacy controls** - Clear data, disable history, hide query context

## 📖 Documentation

- **[Privacy Policy](./PRIVACY_POLICY.md)** - How we handle your data
- **[Permissions](./PERMISSIONS.md)** - Why we need each permission
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Support](./SUPPORT.md)** - How to report bugs
- **[Changelog](./CHANGELOG.md)** - Version history

## 🔒 Privacy

SourceLens is built with privacy as a core principle:

- ✅ **No data collection** - Zero analytics, telemetry, or external API calls
- ✅ **No chat text storage** - We never save your prompts or ChatGPT responses
- ✅ **Local-only processing** - All analysis happens in your browser
- ✅ **Minimal permissions** - Only storage permission and access to ChatGPT domains
- ✅ **You control your data** - Clear pins, history, or all data anytime

**What we store locally:**
- Your preferences (panel position, theme, etc.)
- Pinned sources (URLs, titles, domains, your notes)
- Optional session history (domain counts, hashed IDs - no chat text)

**What we don't store:**
- ChatGPT message text
- Your prompts or questions
- Assistant responses
- Personal information

See our [Privacy Policy](./PRIVACY_POLICY.md) for complete details.

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Build Commands

```bash
# Install dependencies
npm install

# Development mode (watch)
npm run dev

# Production build
npm run build

# Run tests
npm test

# Generate icons
npm run generate-icons

# Package for release
npm run package
```

### Version Management

```bash
# Bump patch version (3.1.0 → 3.1.1)
npm run bump:patch

# Bump minor version (3.1.0 → 3.2.0)
npm run bump:minor

# Bump major version (3.1.0 → 4.0.0)
npm run bump:major
```

### Project Structure

```
gpt-ui/
├── src/
│   ├── content/          # Content script
│   ├── ui/               # React UI components
│   └── shared/           # Shared utilities and types
├── public/               # Static assets
├── dist/                 # Build output
├── release/              # Packaged releases
└── scripts/              # Build scripts
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## 📦 Release Process

1. **Run tests:**
   ```bash
   npm test
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Package:**
   ```bash
   npm run package
   ```
   This creates `release/SourceLens-vX.Y.Z.zip`

4. **Upload to Chrome Web Store:**
   - Go to Chrome Web Store Developer Dashboard
   - Upload the zip file
   - Fill in store listing details (see [STORE_LISTING.md](./STORE_LISTING.md))
   - Submit for review

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- React 18
- TypeScript
- Vite
- Chrome Extension Manifest V3

## 📧 Support

For bug reports and feature requests, please see [SUPPORT.md](./SUPPORT.md).

---

**SourceLens** - Privacy-first enhancement for AI chat interfaces
