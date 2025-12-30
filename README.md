# GPT UI - Enhanced Search Results V3

A Chrome Extension (Manifest V3) that enhances ChatGPT search responses by rendering a more graphical, Google-like results UI inside the ChatGPT page as an overlay panel.

## V3 Features

### 🎯 Preview Mode (Safe, Permission-Minimal)
- **Inline iframe preview**: Click "Preview" to view content in a split-panel view
- **Smart fallback**: Detects X-Frame-Options blocking and shows helpful error message
- **Security-first**: Uses sandboxed iframe with `referrerPolicy="no-referrer"`
- **Quick actions**: When preview is blocked, shows Open/Copy actions
- **Toggle view**: Switch between List and Split preview modes

### 📌 Pinboard / Collections
- **Save results**: Pin any result to save it for later
- **Collections/Folders**: Organize pins into folders (local only)
- **Search & filter**: Search pins, filter by domain/tag, sort by date/domain/title
- **Bulk actions**: Select multiple pins to remove or move to folders
- **Export**: Export pins as JSON or Markdown (download via blob, no server)
- **"Seen again" indicator**: Shows "Pinned" badge when same URL appears in new chats

### 🕒 Session History
- **Privacy-preserving**: Stores only metadata (domains, counts, hashed IDs) - no chat text
- **Recent sessions**: View last 50 sessions with date/time and result counts
- **Domain preview**: See which domains were referenced in each session
- **Clear history**: One-click clear all history and cached data

### ⌨️ Command Palette (Power User)
- **Cmd/Ctrl+K**: Open command palette for quick actions
- **Searchable commands**: Type to filter commands
- **Keyboard navigation**: Arrow keys + Enter to execute
- **Commands available**:
  - Toggle panel
  - Switch tabs (Results/Pins/History)
  - Open settings
  - Toggle highlight sources

### 🎯 Smarter Ranking
- **Local-only scoring**: No AI or external calls
- **Domain diversity**: Prefers unique domains in top results
- **Documentation boost**: Prioritizes docs.*, developer.*, github.com, MDN, etc.
- **Quality signals**: Boosts results with meaningful snippets and reasonable title lengths
- **De-boost trackers**: Reduces ranking for obvious redirect/tracker URLs

### V2 Features (Carried Forward)
- ✅ Enhanced detection with improved heuristics
- ✅ Tag filtering (News/Docs/Video/Forums)
- ✅ Smart URL normalization and deduplication
- ✅ Theme auto-detection (light/dark)
- ✅ Keyboard shortcuts (Cmd/Ctrl+Shift+E, Cmd/Ctrl+Shift+H)
- ✅ Responsive design (desktop panel, mobile bottom sheet)

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

4. **Ranking** (V3):
   - Scores results locally using domain diversity, snippet quality, title length, and domain tags
   - Prioritizes documentation sources
   - De-boosts tracker/redirect URLs

### Preview Mode

Preview uses sandboxed iframes with security best practices:
- **Sandbox attributes**: `allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin`
- **Referrer policy**: `no-referrer` to protect privacy
- **Error detection**: 5-second timeout detects X-Frame-Options blocking
- **Fallback UI**: Shows helpful message when embedding is blocked

**Why some sites block embedding**: Many sites use X-Frame-Options or CSP `frame-ancestors` to prevent clickjacking. This is a security feature, not a bug.

### Privacy & Security

- ✅ **No External APIs**: All processing happens in your browser
- ✅ **No Data Collection**: No telemetry, analytics, or data export
- ✅ **No Remote Script Injection**: Bundle everything locally
- ✅ **Minimal Permissions**: Only requires `storage` permission and access to ChatGPT domains
- ✅ **No Chat Text Storage**: Only stores minimal derived link metadata (URLs/domains) for caching
- ✅ **Hashed IDs**: Chat/conversation IDs are hashed before storage
- ✅ **Local Storage Only**: Settings, pins, and history stored via `chrome.storage.local`
- ✅ **Shadow DOM**: UI is isolated to prevent CSS conflicts with ChatGPT
- ✅ **No Favicon Fetching**: Uses Chrome's internal `chrome://favicon2` service

### What Gets Stored Locally

- **Settings**: User preferences (panel position, default tab, etc.)
- **Pins**: URL, title, domain, tags, notes, folder assignments, timestamps
- **History**: Session metadata (domain lists, result counts, hashed IDs)
- **Cache**: LRU cache of URL metadata (max 200 items)

**What does NOT get stored:**
- ChatGPT message text
- Chat conversation content
- Personal information
- Browsing history outside of extension usage

## Usage

1. **Open ChatGPT**: Navigate to `chatgpt.com` or `chat.openai.com`

2. **Trigger Search Results**: Ask ChatGPT a question that typically returns sources

3. **View Enhanced Results**: 
   - Click the toggle button (🔍) or press `Cmd/Ctrl+Shift+E`
   - Browse results in the panel
   - Use tabs to switch between Results, Pins, and History

4. **Preview Content**:
   - Click "Preview" on any result to view in split mode
   - Toggle between List and Split views
   - Some sites block embedding (X-Frame-Options) - you'll see a helpful message

5. **Pin Results**:
   - Click "Pin" on any result to save it
   - View pins in the Pins tab
   - Organize into folders
   - Export as JSON or Markdown

6. **Command Palette**:
   - Press `Cmd/Ctrl+K` to open
   - Type to search commands
   - Use arrow keys and Enter to execute

7. **Keyboard Shortcuts**:
   - `Cmd/Ctrl+Shift+E`: Toggle panel visibility
   - `Cmd/Ctrl+Shift+H`: Toggle highlight all sources in chat
   - `Cmd/Ctrl+K`: Open command palette

## Settings

Access settings via the ⚙️ icon in the panel header:

- **Enabled**: Enable/disable the extension
- **Panel Position**: Right or Left (desktop)
- **Default Tab**: Results, Pins, or History
- **Default View**: Top Results, All Results, or Grouped by Domain
- **Auto-open panel**: Auto-open when sources detected
- **Auto-open preview**: Auto-open preview in split mode when clicking result
- **Highlight sources**: Highlight sources in chat on toggle
- **Enable top ranking**: Use smart ranking for top results
- **Enable history**: Track session history
- **Snippet length**: Configure snippet length (120–320 chars)
- **Clear all data**: Delete all pins, history, and cache (settings preserved)

## Development

### Project Structure

```
gpt-ui/
├── src/
│   ├── content/              # Content script
│   │   ├── index.tsx         # Main entry point
│   │   ├── mount.tsx         # React mounting
│   │   ├── observer.ts       # MutationObserver
│   │   ├── highlight.ts      # Chat highlighting
│   │   ├── extractor/        # Result extraction
│   │   │   ├── index.ts
│   │   │   ├── heuristics.ts
│   │   │   ├── snippet.ts
│   │   │   ├── rank.ts       # V3 ranking
│   │   │   └── __tests__/
│   │   ├── selectors.ts
│   │   └── styles.css
│   ├── ui/                   # React UI
│   │   ├── App.tsx
│   │   ├── theme.ts
│   │   ├── tabs/             # V3 tabs
│   │   │   ├── PinsTab.tsx
│   │   │   └── HistoryTab.tsx
│   │   ├── components/
│   │   │   ├── Panel.tsx
│   │   │   ├── ResultsTab.tsx
│   │   │   ├── PreviewPane.tsx
│   │   │   ├── SplitView.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── PinItemCard.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       ├── usePins.ts
│   │       ├── useHistory.ts
│   │       └── useCommandPalette.ts
│   └── shared/               # Shared utilities
│       ├── types.ts
│       ├── storage-v3.ts     # V3 storage with migrations
│       └── utils/
│           ├── url.ts
│           ├── hash.ts
│           ├── tags.ts
│           └── download.ts   # V3 export
├── public/
│   └── icons/
├── manifest.json
├── vite.config.ts
└── package.json
```

### Build Commands

- `npm run build`: Build production bundle
- `npm run dev`: Watch mode for development
- `npm test`: Run unit tests
- `npm run test:watch`: Run tests in watch mode

### Testing

See [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for comprehensive testing guidelines.

Unit tests cover:
- URL normalization and deduplication
- Hash generation
- Domain tagging heuristics
- Ranking logic (V3)

Run tests with:
```bash
npm test
```

## Known Limitations

1. **ChatGPT DOM Changes**: ChatGPT's DOM structure may change, requiring selector updates. The extension uses layered selectors and heuristics to be resilient, but major UI overhauls may require updates.

2. **Preview Blocking**: Many sites block embedding via X-Frame-Options or CSP. This is a security feature - the extension detects this and shows a fallback message.

3. **Streaming Detection**: Some streaming updates may be missed; extension uses MutationObserver with 300ms debouncing for optimal performance.

4. **Highlight Accuracy**: Highlighting relies on selector hints; if ChatGPT changes its DOM structure significantly, highlights may not work until selectors are updated.

5. **Favicon Loading**: Uses Chrome's internal `chrome://favicon2` service, which may not always have favicons for all domains.

6. **Storage Limits**: Pins max 2000, history max 50 sessions, cache max 200 items (enforced with LRU eviction).

## Troubleshooting

**Extension not working:**
- Check browser console for errors (`F12` → Console)
- Verify extension is enabled in `chrome://extensions/`
- Ensure you're on `chatgpt.com` or `chat.openai.com`
- Try reloading the page

**Preview not working:**
- Many sites block iframe embedding (X-Frame-Options) - this is expected
- Use "Open in new tab" instead
- Check browser console for iframe errors

**Pins not saving:**
- Check storage quota (chrome://extensions → extension → Details → Storage)
- Verify extension has storage permission
- Check browser console for errors

**Command palette not opening:**
- Ensure panel is visible first
- Try `Cmd/Ctrl+K` when panel is open
- Check for conflicts with ChatGPT keyboard shortcuts

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
