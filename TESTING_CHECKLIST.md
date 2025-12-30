# Testing Checklist for GPT-UI V2

This checklist helps ensure the extension works correctly across different scenarios.

## Pre-Testing Setup

- [ ] Extension is built (`npm run build`)
- [ ] Extension is loaded in Chrome (`chrome://extensions/` → Load unpacked → select `dist/`)
- [ ] Extension is enabled
- [ ] You're on `https://chatgpt.com/*` or `https://chat.openai.com/*`

## Basic Functionality

### Initial Detection

- [ ] Toggle button (🔍) appears in bottom-right corner after page load
- [ ] Button shows correct result count in tooltip
- [ ] Clicking button opens/closes the panel
- [ ] Keyboard shortcut `Cmd/Ctrl+Shift+E` toggles panel

### Panel Display

- [ ] Panel appears on the right side (desktop)
- [ ] Panel appears as bottom sheet on mobile/small screens (< 900px width)
- [ ] Panel header shows "Enhanced Results" title
- [ ] Settings icon (⚙️) is visible in header
- [ ] Close button (×) works
- [ ] Panel can be scrolled if content overflows

### Theme Detection

- [ ] Panel matches ChatGPT light theme (when ChatGPT is in light mode)
- [ ] Panel matches ChatGPT dark theme (when ChatGPT is in dark mode)
- [ ] Toggle ChatGPT theme → panel theme updates (may require page reload)

## Result Extraction

### Test with Multiple Chat Scenarios

#### Scenario 1: Simple Search Query
- [ ] Ask: "What are the latest developments in AI?"
- [ ] Wait for assistant response with sources
- [ ] Verify results are detected and displayed
- [ ] Check that external links are extracted
- [ ] Verify ChatGPT/OpenAI links are excluded

#### Scenario 2: Sources Section
- [ ] Ask: "Search for recent articles about climate change"
- [ ] Look for message with "Sources:" or "Citations:" header
- [ ] Verify all links in sources section are extracted
- [ ] Check that results are properly formatted

#### Scenario 3: Numbered Citations
- [ ] Ask: "Find information about TypeScript with references"
- [ ] Look for numbered citations like [1], [2], (1), (2)
- [ ] Verify citation-style links are detected
- [ ] Check that citation numbers are not included in result titles

#### Scenario 4: Streaming Responses
- [ ] Ask a question that triggers a search response
- [ ] Watch as response streams
- [ ] Verify results appear progressively as links are added
- [ ] Check that panel updates without breaking UI

#### Scenario 5: Multiple Messages
- [ ] Have multiple assistant messages with sources in the same chat
- [ ] Verify all messages are scanned
- [ ] Check that duplicates are handled correctly
- [ ] Verify duplicate count badges appear

## UI Components

### Result Cards

- [ ] Favicons display correctly (or fallback globe icon shows)
- [ ] Titles are readable and not truncated incorrectly
- [ ] Domains are displayed correctly
- [ ] Snippets are displayed (or fallback text shows)
- [ ] Tags are visible (news, doc, video, forum, citation)
- [ ] Duplicate count badge appears for duplicates (>1)
- [ ] Card hover effect works

### Result Actions

- [ ] **Open**: Opens link in new tab (check `target="_blank"`, `rel="noopener noreferrer"`)
- [ ] **Copy link**: Copies URL to clipboard (verify in clipboard)
- [ ] **Copy citation**: Copies formatted citation `[title] (domain) - url` (verify format)
- [ ] **Highlight**: Scrolls to link in chat and highlights it briefly (~1.2s)

### Filters

- [ ] Search input filters results by title/domain/snippet
- [ ] Tag chips filter by tag (News, Docs, Video, Forum, All)
- [ ] Tag counts are correct
- [ ] Multiple filters can be combined
- [ ] "All" chip clears tag filter

### Sorting

- [ ] **Original**: Maintains extraction order
- [ ] **Domain**: Sorts alphabetically by domain
- [ ] **Title**: Sorts alphabetically by title
- [ ] Sort persists when filtering

### Grouped View

- [ ] Toggle "Show Grouped by Domain" works
- [ ] Groups are collapsible (click header to expand/collapse)
- [ ] Domain headers show correct counts
- [ ] Groups are sorted alphabetically
- [ ] Expand/collapse icons (▲/▼) are visible

### Top Results Section

- [ ] When `defaultView` is "top", top 6 results are shown first
- [ ] "All Results" section shows remaining results
- [ ] Top results section header shows correct count

## Settings

### Settings Modal

- [ ] Clicking ⚙️ opens settings modal
- [ ] Modal is centered and overlay is visible
- [ ] Clicking overlay closes modal
- [ ] Clicking "Cancel" closes without saving
- [ ] Clicking "Save" saves and closes

### Settings Options

- [ ] **Enabled**: Toggle disables/enables extension
- [ ] **Panel Position**: "Right" positions panel on right (default)
- [ ] **Panel Position**: "Left" positions panel on left
- [ ] **Default View**: "Top" shows top results first
- [ ] **Default View**: "All" shows all results
- [ ] **Default View**: "Grouped" shows grouped by domain
- [ ] **Auto-open panel**: When enabled, panel opens automatically when sources detected
- [ ] **Highlight sources**: When enabled, highlights sources in chat (test with `Cmd/Ctrl+Shift+H`)
- [ ] **Snippet length**: Slider changes snippet length (120-320 chars)
- [ ] Settings persist after page reload

## Keyboard Shortcuts

- [ ] `Cmd/Ctrl+Shift+E`: Toggles panel visibility
- [ ] `Cmd/Ctrl+Shift+H`: Toggles highlight all sources in chat
- [ ] Shortcuts work when typing in ChatGPT input (don't interfere)
- [ ] Shortcuts work when panel is open/closed

## Highlight Functionality

### Individual Highlight

- [ ] Clicking "Highlight" on a result card scrolls to the link
- [ ] Link is outlined in blue for ~1.2 seconds
- [ ] Outline fades out smoothly
- [ ] Works even if link is far down in the chat

### Toggle All Highlights

- [ ] `Cmd/Ctrl+Shift+H` highlights all source links
- [ ] Second press clears highlights
- [ ] Multiple calls toggle correctly
- [ ] Highlighted links remain highlighted until toggled off

## Performance & Robustness

### DOM Changes

- [ ] Extension continues working when ChatGPT UI updates
- [ ] MutationObserver detects new messages
- [ ] Results update when new sources appear
- [ ] No console errors during normal operation

### Edge Cases

- [ ] Empty state displays when no results found
- [ ] Empty state message is helpful ("Try asking ChatGPT to search...")
- [ ] Extension handles very long result lists (>40 items)
- [ ] Extension handles special characters in URLs/titles
- [ ] Extension handles URLs with various schemes (http, https)
- [ ] Extension handles international domains (IDN)
- [ ] Extension handles URLs with ports, paths, fragments

### Responsive Design

- [ ] Panel adapts to window resize
- [ ] Bottom sheet appears on screens < 900px wide
- [ ] Panel is usable on mobile viewport sizes
- [ ] Toggle button is accessible on all screen sizes

## Privacy & Security

- [ ] No network requests to external domains (check Network tab)
- [ ] No analytics or telemetry calls
- [ ] Settings stored only in `chrome.storage.local`
- [ ] No chat text is stored (only URLs/domains for caching)
- [ ] Favicons use `chrome://favicon2` (no external requests)
- [ ] Extension only runs on ChatGPT domains

## Cross-Browser Testing

- [ ] Works in Chrome
- [ ] Works in Chromium-based browsers (Edge, Brave, etc.)
- [ ] Test on different OS (Windows, macOS, Linux)

## Regression Testing

### V1 → V2 Migration

- [ ] Old settings are migrated correctly
- [ ] Legacy `showGroupedByDomain` setting is handled
- [ ] No breaking changes for existing users

## Known Limitations (Verify)

- [ ] ChatGPT DOM structure changes may break selectors (document any new breakages)
- [ ] Some streaming updates may be missed (acceptable, has backup polling)
- [ ] Highlight accuracy depends on selector hints (may fail with major DOM changes)
- [ ] Favicon service may not have all favicons (fallback works)

## Post-Testing

- [ ] No console errors or warnings
- [ ] Performance is acceptable (no lag when typing)
- [ ] Extension doesn't interfere with ChatGPT's typing/streaming
- [ ] Extension cleans up properly when disabled
- [ ] Extension re-initializes correctly after page navigation (SPA)

## Notes

Document any issues, edge cases, or improvements needed:

---

**Test Date**: _______________  
**Tester**: _______________  
**Chrome Version**: _______________  
**Extension Version**: _______________  
**ChatGPT Domain**: _______________

