# GPT UI - Enhanced Search Results

A Chrome Extension (Manifest V3) that enhances ChatGPT search responses by rendering a more graphical, Google-like results UI inside the ChatGPT page as an overlay panel.

## Features

- 🎯 **Automatic Detection**: Detects search-like results in ChatGPT assistant messages
- 🎨 **Google-like UI**: Beautiful card-based results with favicons, domains, and snippets
- 🔍 **Search & Filter**: Search within results, filter by domain, sort options
- 📱 **Responsive**: Adapts to mobile/tablet viewports with bottom sheet layout
- 🔒 **Privacy First**: All processing happens locally, no data leaves your device
- ⚡ **Real-time Updates**: Auto-updates as ChatGPT streams responses
- ⌨️ **Keyboard Shortcuts**: Toggle panel with `Cmd/Ctrl+Shift+E`

## Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Chrome or Chromium-based browser

### Build Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate extension icons:**
   ```bash
   npm run generate-icons
   ```
   
   This automatically creates three PNG icons in `public/icons/` with a search emoji on a blue background.
   
   If you prefer custom icons, you can replace the generated files with your own.

3. **Build the extension:**
   ```bash
   npm run build
   ```
   
   This creates a `dist/` folder with the compiled extension.

4. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist/` folder from this project

## How It Works

### Detection Heuristics

The extension uses resilient selectors and heuristics to detect search results:

1. **Message Detection**: Identifies assistant messages by:
   - Looking for `role="assistant"` attributes
   - Finding message blocks with external links (excluding ChatGPT/OpenAI domains)
   - Detecting "Sources", "Citations", or "References" text

2. **Result Extraction**: Extracts results from:
   - External links (http/https) in assistant messages
   - Title from link text, headings, or URL
   - Snippet from surrounding text or list items
   - Domain from URL hostname

3. **Deduplication**: Normalizes URLs (removes trailing slashes, UTM params) to avoid duplicates

### UI Components

- **Panel**: Right-side overlay (or bottom sheet on mobile) with search results
- **Result Cards**: Display favicon, title, domain, snippet, and action buttons
- **Filters**: Search input, domain chips, sort controls
- **Grouped View**: Option to view results grouped by domain
- **Toggle Button**: Floating button to show/hide panel

### Privacy & Security

- ✅ **No External APIs**: All processing happens in your browser
- ✅ **No Data Collection**: No telemetry, analytics, or data export
- ✅ **Minimal Permissions**: Only requires storage permission and access to ChatGPT domains
- ✅ **Local Storage Only**: Settings stored locally via `chrome.storage.local`
- ✅ **Shadow DOM**: UI is isolated to prevent CSS conflicts with ChatGPT

## Usage

1. **Open ChatGPT**: Navigate to `chatgpt.com` or `chat.openai.com`

2. **Trigger Search Results**: Ask ChatGPT a question that typically returns sources, for example:
   - "What are the latest developments in AI?"
   - "Search for information about climate change"
   - "Find recent articles about TypeScript"

3. **View Enhanced Results**: 
   - The extension automatically detects results and shows a toggle button (🔍)
   - Click the toggle button or press `Cmd/Ctrl+Shift+E` to open the panel
   - Browse, search, filter, and interact with results

4. **Actions Available**:
   - **Open**: Open result in new tab
   - **Copy link**: Copy URL to clipboard
   - **Copy domain**: Copy domain name to clipboard
   - **Highlight**: Scroll to and highlight the original link in the chat

## Settings

Settings are stored locally and can be accessed via Chrome's extension storage:

- `enabled`: Enable/disable the extension (default: `true`)
- `panelPosition`: Panel position - `left` or `right` (default: `right`)
- `showGroupedByDomain`: Show grouped view by default (default: `true`)

## Development

### Project Structure

```
gpt-ui/
├── src/
│   ├── content/          # Content script (runs on ChatGPT pages)
│   │   ├── index.tsx     # Main entry point, DOM observation
│   │   ├── extractor.ts  # Extract results from DOM
│   │   ├── selectors.ts  # Resilient selectors/heuristics
│   │   └── styles.css    # Panel styles
│   ├── ui/               # React UI components
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── Panel.tsx
│   │       ├── ResultCard.tsx
│   │       ├── Filters.tsx
│   │       ├── GroupedResults.tsx
│   │       └── EmptyState.tsx
│   └── shared/           # Shared utilities
│       ├── types.ts
│       ├── storage.ts
│       └── utils/
│           ├── url.ts
│           └── text.ts
├── public/
│   └── icons/            # Extension icons
├── manifest.json         # Chrome extension manifest
├── vite.config.ts        # Vite build configuration
└── package.json
```

### Build Commands

- `npm run build`: Build production bundle
- `npm run dev`: Watch mode for development

### Known Limitations

1. **ChatGPT DOM Changes**: ChatGPT's DOM structure may change, requiring selector updates
2. **Streaming Detection**: Some streaming updates may be missed; extension polls every 2 seconds as backup
3. **Favicon Loading**: Favicons may fail to load due to CORS or missing files
4. **No OG Metadata**: Extension doesn't fetch Open Graph metadata (by design, for privacy)

### Troubleshooting

**Extension not working:**
- Check browser console for errors (`F12` → Console)
- Verify extension is enabled in `chrome://extensions/`
- Ensure you're on `chatgpt.com` or `chat.openai.com`

**No results detected:**
- Make sure the assistant message contains external links
- Try a different prompt that typically returns sources
- Check if links are actually external (not ChatGPT/OpenAI domains)

**Styling issues:**
- Extension uses Shadow DOM to isolate styles
- If ChatGPT updates their CSS, conflicts are unlikely but possible

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Built with:
- React 18
- TypeScript
- Vite
- Chrome Extension Manifest V3
