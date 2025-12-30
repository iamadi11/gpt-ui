# Testing Checklist for GPT-UI V3

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

### Panel Display & Tabs

- [ ] Panel appears on the right side (desktop)
- [ ] Panel appears as bottom sheet on mobile/small screens (< 900px width)
- [ ] Panel header shows "Enhanced Results" title
- [ ] Settings icon (⚙️) is visible in header
- [ ] Close button (×) works
- [ ] Tab navigation shows: Results, Pins, History
- [ ] Clicking tabs switches between views
- [ ] Default tab matches settings

## Results Tab

### Result Extraction & Display

- [ ] Results are detected and displayed correctly
- [ ] Top results section appears (if ranking enabled)
- [ ] All results section appears
- [ ] Result cards show: favicon, title, domain, snippet, tags
- [ ] Duplicate count badges appear for duplicates
- [ ] "Pinned" badge appears on pinned results

### Result Actions

- [ ] **Preview**: Opens preview in split mode (if enabled) or opens in new tab
- [ ] **Pin**: Pins the result (badge appears, item appears in Pins tab)
- [ ] **Open**: Opens link in new tab
- [ ] **Copy link**: Copies URL to clipboard
- [ ] **Copy citation**: Copies formatted citation `[title] (domain) - url`
- [ ] **Highlight**: Scrolls to link in chat and highlights briefly

### Preview Mode

- [ ] Clicking "Preview" opens split view
- [ ] Preview pane shows iframe with content (if not blocked)
- [ ] Preview header shows favicon, title, domain
- [ ] Pin button in preview header works
- [ ] Close button in preview closes preview
- [ ] "List / Split" toggle button works
- [ ] X-Frame-Options blocking is detected (shows error message)
- [ ] Error message shows "Open in new tab" button
- [ ] Preview iframe is sandboxed (check browser dev tools)

### Filtering & Sorting

- [ ] Search input filters results by title/domain/snippet
- [ ] Tag chips filter by tag (News, Docs, Video, Forum, All)
- [ ] Sort options work: Original, Domain, Title
- [ ] Grouped view toggle works

### Ranking (V3)

- [ ] Top results use smart ranking when enabled
- [ ] Documentation domains are prioritized
- [ ] Domain diversity is considered
- [ ] Results with snippets rank higher
- [ ] Tracker URLs are de-boosted

## Pins Tab

### Pin Management

- [ ] Pinning a result adds it to Pins tab
- [ ] Unpinning removes it from Pins tab
- [ ] Pinned items show in Pins tab with all metadata
- [ ] "Pinned" badge appears on pinned results in Results tab
- [ ] Pins persist across page reloads

### Pin Organization

- [ ] Default "All Pins" folder exists
- [ ] Creating new folder works
- [ ] Folder dropdown shows all folders
- [ ] Filtering by folder works
- [ ] Moving pins to folders works
- [ ] Bulk move works (select multiple, move to folder)

### Pin Search & Filter

- [ ] Search input filters pins by title/domain/note/tags
- [ ] Sort options work: Pinned Date, Last Seen, Domain, Title
- [ ] Pin count displays correctly

### Pin Export

- [ ] Export JSON downloads JSON file
- [ ] Export Markdown downloads MD file
- [ ] JSON format is valid and contains all pin data
- [ ] Markdown format is readable and properly formatted
- [ ] Files download without server (blob download)

### Bulk Actions

- [ ] Selecting pins with checkboxes works
- [ ] "Unpin Selected" removes selected pins
- [ ] "Move to..." moves selected pins to folder
- [ ] Selection state persists correctly

## History Tab

### Session Tracking

- [ ] Sessions appear in History tab after results are detected
- [ ] Session shows: date/time, result count, top domains
- [ ] Sessions are sorted by date (newest first)
- [ ] Maximum 50 sessions are stored (older ones removed)
- [ ] History persists across page reloads

### History Display

- [ ] Date/time formatting is readable
- [ ] Domain lists show top 3 domains
- [ ] Result counts are accurate
- [ ] Empty state shows when no history

### History Management

- [ ] "Clear History" button works
- [ ] Confirmation dialog appears before clearing
- [ ] Clearing history removes all sessions

## Command Palette

### Opening & Navigation

- [ ] `Cmd/Ctrl+K` opens command palette
- [ ] Command palette appears centered
- [ ] Search input is focused automatically
- [ ] Typing filters commands
- [ ] Arrow keys navigate commands
- [ ] Enter executes selected command
- [ ] Escape closes command palette

### Command Execution

- [ ] "Toggle Panel" command works
- [ ] "Open Settings" command works
- [ ] Commands close palette after execution
- [ ] No conflicts with ChatGPT input (only active when palette open)

## Settings

### Settings Modal

- [ ] Settings modal opens via ⚙️ icon
- [ ] All V3 settings are visible and editable:
  - Default Tab (Results/Pins/History)
  - Default View (Top/All/Grouped)
  - Auto-open preview
  - Enable top ranking
  - Enable history
  - Snippet length slider
- [ ] Settings persist after save
- [ ] "Clear All Data" button works
- [ ] Clear data confirmation shows
- [ ] Clearing data removes pins/history/cache but preserves settings

## Privacy & Security

- [ ] No network requests to external domains (check Network tab)
- [ ] No analytics or telemetry calls
- [ ] Settings stored only in `chrome.storage.local`
- [ ] No chat text is stored (verify in storage)
- [ ] Chat IDs are hashed before storage
- [ ] Preview iframe uses sandbox attributes
- [ ] Preview iframe uses `referrerPolicy="no-referrer"`
- [ ] Extension only runs on ChatGPT domains

## Performance & Robustness

### DOM Changes

- [ ] Extension continues working when ChatGPT UI updates
- [ ] MutationObserver detects new messages
- [ ] Results update when new sources appear
- [ ] No console errors during normal operation

### Typing & Streaming

- [ ] Extension doesn't interfere with ChatGPT typing
- [ ] Streaming responses update results smoothly
- [ ] No lag when typing in ChatGPT input
- [ ] Panel updates don't cause page stuttering

### Edge Cases

- [ ] Empty state displays when no results found
- [ ] Extension handles very long result lists (>40 items)
- [ ] Extension handles special characters in URLs/titles
- [ ] Extension handles URLs with various schemes (http, https)
- [ ] Extension handles international domains (IDN)
- [ ] Preview timeout works (5 seconds for blocking detection)
- [ ] Storage limits enforced (max pins, history, cache)

## Cross-Browser Testing

- [ ] Works in Chrome
- [ ] Works in Chromium-based browsers (Edge, Brave, etc.)
- [ ] Test on different OS (Windows, macOS, Linux)

## Theme Testing

- [ ] Panel matches ChatGPT light theme
- [ ] Panel matches ChatGPT dark theme
- [ ] Theme detection updates when ChatGPT theme changes
- [ ] All components respect theme (tabs, modals, preview, etc.)

## Regression Testing

### V2 → V3 Migration

- [ ] Old settings are migrated correctly
- [ ] Legacy `showGroupedByDomain` setting is handled
- [ ] Storage schema migration works (v1 → v2 → v3)
- [ ] No breaking changes for existing users

## Known Limitations (Verify)

- [ ] ChatGPT DOM structure changes may break selectors (document any new breakages)
- [ ] Some sites block iframe embedding (expected behavior)
- [ ] Some streaming updates may be missed (acceptable, has backup polling)
- [ ] Highlight accuracy depends on selector hints (may fail with major DOM changes)
- [ ] Favicon service may not have all favicons (fallback works)
- [ ] Storage limits may require cleanup (LRU eviction handles this)

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
**Extension Version**: V3  
**ChatGPT Domain**: _______________
