# GPT UI - Enhanced Search Results V2

A Chrome Extension (Manifest V3) that enhances ChatGPT search responses by rendering a more graphical, Google-like results UI inside the ChatGPT page as an overlay panel.

## V2 Features

### Better Detection & Extraction
- ✅ Improved DOM heuristics to reliably detect "search-like" assistant messages
- ✅ Detects presence of "Sources", "Citations", "References" headers (case-insensitive)
- ✅ Identifies multiple outbound links and citation-style link clusters
- ✅ Enhanced Result model with stable IDs, source message tracking, and tags
- ✅ Smart URL normalization and deduplication (collapses http/https, removes UTM params)
- ✅ Fast O(n) extraction algorithm

### UI/UX Upgrades
- ✅ Right-side panel on desktop; bottom sheet on small widths (< 900px)
- ✅ Panel sections:
  - Top results (first 4–6)
  - Grouped by domain (collapsible)
  - All results (full list)
- ✅ Search-in-results (client-side filter)
- ✅ Filter chips by tag (Docs/News/Video/Forums/All) based on domain heuristics
- ✅ Sort: Original | Domain | Title
- ✅ Toggle: Grouped view ON/OFF
- ✅ Result cards with:
  - Favicon via Chrome's internal `chrome://favicon2` service
  - Title + domain + snippet
  - Actions: Open, Copy link, Copy citation, Highlight in chat
  - Duplicate count badge
  - Tag indicators

### Settings & Controls
- ✅ Floating toggle button (non-intrusive) near bottom-right
- ✅ Keyboard shortcuts:
  - `Cmd/Ctrl+Shift+E`: toggle panel
  - `Cmd/Ctrl+Shift+H`: highlight sources in chat (toggle)
- ✅ Settings modal with:
  - Enabled toggle
  - Panel position: Right | Left (desktop)
  - Default view: Top/All/Grouped
  - Auto-open panel when sources detected
  - Highlight sources in chat
  - Snippet length slider (120–320 chars)

### Theming & Accessibility
- ✅ Automatically matches ChatGPT theme (light/dark)
- ✅ CSS variables for seamless theme switching
- ✅ Keyboard navigable panel
- ✅ ARIA labels on buttons
- ✅ Color contrast compliant

### Robustness
- ✅ Layered selectors (semantic markers, fallback heuristics)
- ✅ MutationObserver with debouncing (300ms)
- ✅ Ignores mutations from own Shadow DOM
- ✅ Graceful empty state with helpful CTAs

### Performance
- ✅ React + TypeScript
- ✅ Vite build for MV3 extension
- ✅ Modular code organization
- ✅ Unit tests with Vitest (URL normalization, hashing, domain tagging)

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

5. **Run tests (optional):**
   ```bash
   npm test
   ```

## How It Works

### Detection Heuristics

The extension uses resilient selectors and heuristics to detect search results:

1. **Message Detection**: Identifies assistant messages by:
   - Looking for `role="assistant"` or `data-message-author-role="assistant"` attributes
   - Finding message blocks with external links (excluding ChatGPT/OpenAI domains)
   - Detecting "Sources", "Citations", or "References" text (case-insensitive)
   - Identifying citation-style patterns (numbered/bracketed references)
   - Detecting link clusters

2. **Result Extraction**: Extracts results with:
   - Stable hash-based IDs from normalized URLs
   - Original URL (preserves http/https)
   - Domain extraction
   - Title from anchor text, headings, or URL parsing
   - Snippet from surrounding text nodes (configurable length)
   - Source message ID and selector hints for highlighting
   - Tags derived from domain heuristics (citation, news, doc, video, forum)

3. **Deduplication**: 
   - Normalizes URLs (collapses http/https, removes trailing slash, strips UTM params)
   - Tracks duplicates with count badges
   - Keeps first occurrence position

### UI Components

- **Panel**: Right-side overlay (or bottom sheet on mobile) with search results
- **Result Cards**: Display favicon (via `chrome://favicon2`), title, domain, snippet, tags, and action buttons
- **Filters**: Search input, tag chips, sort controls
- **Grouped View**: Collapsible domain groups
- **Toggle Button**: Floating button to show/hide panel
- **Settings Modal**: Comprehensive settings UI

### Privacy & Security

- ✅ **No External APIs**: All processing happens in your browser
- ✅ **No Data Collection**: No telemetry, analytics, or data export
- ✅ **No Remote Script Injection**: Bundle everything locally
- ✅ **Minimal Permissions**: Only requires `storage` permission and access to ChatGPT domains (`https://chatgpt.com/*`, `https://chat.openai.com/*`)
- ✅ **Local Storage Only**: Settings stored locally via `chrome.storage.local`
- ✅ **No Chat Text Storage**: Only stores minimal derived link metadata (URLs/domains) for caching
- ✅ **Shadow DOM**: UI is isolated to prevent CSS conflicts with ChatGPT
- ✅ **No Favicon Fetching**: Uses Chrome's internal favicon service (no host permissions needed)

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
   - **Copy citation**: Copy formatted citation `[title] (domain) - url`
   - **Highlight**: Scroll to and highlight the original link in the chat
   - **Filter by tags**: Click tag chips to filter (News, Docs, Video, Forum, etc.)
   - **Sort**: Change sort order (Original, Domain, Title)

5. **Keyboard Shortcuts**:
   - `Cmd/Ctrl+Shift+E`: Toggle panel visibility
   - `Cmd/Ctrl+Shift+H`: Toggle highlight all sources in chat

6. **Settings**: Click the ⚙️ icon in the panel header to access settings

## Settings

Settings are stored locally and can be accessed via the Settings modal:

- `enabled`: Enable/disable the extension (default: `true`)
- `panelPosition`: Panel position - `left` or `right` (default: `right`)
- `defaultView`: Default view mode - `top`, `all`, or `grouped` (default: `top`)
- `autoOpenPanel`: Auto-open panel when sources detected (default: `true`)
- `highlightSourcesInChat`: Highlight sources in chat on toggle (default: `false`)
- `snippetLength`: Snippet length in characters, 120–320 (default: `150`)

## Development

### Project Structure

```
gpt-ui/
├── src/
│   ├── content/              # Content script (runs on ChatGPT pages)
│   │   ├── index.tsx         # Main entry point, DOM observation
│   │   ├── mount.tsx         # React mounting in Shadow DOM
│   │   ├── observer.ts       # MutationObserver with debouncing
│   │   ├── highlight.ts      # Chat highlighting functionality
│   │   ├── extractor/        # Result extraction
│   │   │   ├── index.ts      # Main extractor
│   │   │   ├── heuristics.ts # Detection heuristics
│   │   │   ├── snippet.ts    # Snippet extraction
│   │   │   └── normalizeUrl.ts
│   │   ├── selectors.ts      # Resilient selectors/heuristics
│   │   └── styles.css        # Panel styles with theming
│   ├── ui/                   # React UI components
│   │   ├── App.tsx
│   │   ├── theme.ts          # Theme detection
│   │   └── components/
│   │       ├── Panel.tsx
│   │       ├── ResultCard.tsx
│   │       ├── Filters.tsx
│   │       ├── GroupedResults.tsx
│   │       ├── SettingsModal.tsx
│   │       └── EmptyState.tsx
│   └── shared/               # Shared utilities
│       ├── types.ts
│       ├── storage.ts
│       └── utils/
│           ├── url.ts
│           ├── hash.ts
│           ├── tags.ts
│           ├── text.ts
│           └── debounce.ts
├── public/
│   └── icons/                # Extension icons
├── manifest.json             # Chrome extension manifest
├── vite.config.ts            # Vite build configuration
├── vitest.config.ts          # Vitest test configuration
└── package.json
```

### Build Commands

- `npm run build`: Build production bundle
- `npm run dev`: Watch mode for development
- `npm test`: Run unit tests
- `npm run test:watch`: Run tests in watch mode

### Testing

See [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for comprehensive testing guidelines.

Unit tests are available for:
- URL normalization and deduplication
- Hash generation
- Domain tagging heuristics

Run tests with:
```bash
npm test
```

### Known Limitations

1. **ChatGPT DOM Changes**: ChatGPT's DOM structure may change, requiring selector updates. The extension uses layered selectors and heuristics to be resilient, but major UI overhauls may require updates.

2. **Streaming Detection**: Some streaming updates may be missed; extension uses MutationObserver with 300ms debouncing for optimal performance.

3. **X-Frame Restrictions**: Some sites may block being loaded in iframes (not applicable here, but mentioned for completeness).

4. **Highlight Accuracy**: Highlighting relies on selector hints; if ChatGPT changes its DOM structure significantly, highlights may not work until selectors are updated.

5. **Favicon Loading**: Uses Chrome's internal `chrome://favicon2` service, which may not always have favicons for all domains.

### Troubleshooting

**Extension not working:**
- Check browser console for errors (`F12` → Console)
- Verify extension is enabled in `chrome://extensions/`
- Ensure you're on `chatgpt.com` or `chat.openai.com`
- Try reloading the page

**No results detected:**
- Make sure the assistant message contains external links
- Try a different prompt that typically returns sources
- Check if links are actually external (not ChatGPT/OpenAI domains)
- Look for messages with "Sources", "Citations", or "References" text

**Styling issues:**
- Extension uses Shadow DOM to isolate styles
- Theme detection should automatically match ChatGPT's theme
- If theme detection fails, try toggling ChatGPT's theme and reloading

**Highlight not working:**
- Ensure the source link is still visible in the chat
- Try scrolling to the message manually first
- Check browser console for selector errors

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Built with:
- React 18
- TypeScript
- Vite
- Vitest
- Chrome Extension Manifest V3
