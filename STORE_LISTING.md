# Chrome Web Store Listing

## Title
SourceLens (45 chars)

## Short Description (132 chars max)
Enhanced results panel for AI chats with preview, pins, and local-only knowledge insights. Privacy-first, no data leaves your device.

## Detailed Description

### What is SourceLens?

SourceLens transforms AI chat search results into a visual, Google-like results panel. It extracts sources from assistant messages and presents them in an organized, interactive overlay—all while keeping your data completely private and local.

### Key Features

• **Visual Results Panel** - See all sources in an organized card layout with favicons, titles, domains, and snippets

• **Split Preview Mode** - Preview web pages directly in the panel using a secure sandboxed iframe (with graceful fallback for sites that block embedding)

• **Pinboard & Collections** - Save important sources to folders, search your pins, and export them as JSON or Markdown

• **Local Knowledge Panel** - Get insights about your results: top domains, diversity scores, source quality signals, and date hints—all computed locally, never sent anywhere

• **Intent-Based Filtering** - Quickly filter results by category: Docs, News, Video, Forums, Shopping, Research

• **Session History** - Review your recent search sessions (privacy-preserving metadata only—no chat text stored)

• **Command Palette** - Press Cmd/Ctrl+K for quick actions

• **Smart Ranking** - Top results are intelligently ranked using local-only heuristics (domain diversity, quality signals)

• **Keyword Highlighting** - Search terms are highlighted in result snippets for easy scanning

### How to Use

1. Install SourceLens from the Chrome Web Store
2. Visit chatgpt.com or chat.openai.com
3. Ask a question that generates sources
4. Click the toggle button (🔍) or press Cmd/Ctrl+Shift+E to open the results panel
5. Browse results, preview content, pin important sources, or export your findings

### Privacy First

SourceLens is built with privacy as a core principle:
- **No data collection** - Zero analytics, telemetry, or external API calls
- **No chat text storage** - We never save your prompts or ChatGPT responses
- **Local-only processing** - All analysis happens in your browser
- **Minimal permissions** - Only requires storage permission and access to ChatGPT domains
- **You control your data** - Clear pins, history, or all data anytime from settings

### Permissions Explained

• **Storage** - Saves your preferences, pinned sources, and optional session history locally
• **Host permissions (chatgpt.com, chat.openai.com)** - Required to inject the results panel overlay on these domains only

SourceLens does NOT request access to:
- Your browsing history
- Other websites
- Personal information
- External network requests

### Limitations

• ChatGPT DOM changes may require extension updates (we use resilient selectors to minimize this)
• Some websites block iframe embedding (X-Frame-Options), so preview may show a fallback message
• Preview functionality requires sites to allow embedding (this is a security feature, not a bug)

### Keyboard Shortcuts

• `Cmd/Ctrl+Shift+E` - Toggle results panel
• `Cmd/Ctrl+Shift+H` - Toggle highlight sources in chat
• `Cmd/Ctrl+K` - Open command palette

## Category
Productivity

## Keywords
chatgpt, results, sources, search, preview, pins, bookmarks, productivity, ai, assistant, links, citations, references

