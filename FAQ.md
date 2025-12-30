# Frequently Asked Questions (FAQ)

## General Questions

### What is SourceLens?

SourceLens is a Chrome extension that enhances AI chat search results by displaying them in an organized, visual panel. It extracts sources from ChatGPT responses and presents them in a Google-like results interface with preview, pins, and local-only knowledge insights.

### How do I install SourceLens?

**From Chrome Web Store (Coming Soon):**
1. Visit the Chrome Web Store
2. Search for "SourceLens"
3. Click "Add to Chrome"

**Load Unpacked (Development):**
1. Clone the repository: `git clone https://github.com/iamadi11/gpt-ui.git`
2. Run `npm install` and `npm run build`
3. Go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `dist/` folder

### Which websites does SourceLens work on?

SourceLens only works on:
- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

The extension does not work on other websites for privacy and security reasons.

## Privacy & Data

### Does SourceLens read my ChatGPT conversations?

**No.** SourceLens does not read, store, or transmit your ChatGPT conversations. It only:
- Extracts source links from assistant messages (the URLs that ChatGPT cites)
- Displays them in an organized panel
- Allows you to preview, pin, and organize these sources

**What we don't store:**
- Your prompts or questions
- ChatGPT's responses or message text
- Your account information
- Any personal data

### What data does SourceLens store?

SourceLens stores only:
- **Settings**: Your preferences (panel position, theme, etc.)
- **Pins**: URLs, titles, domains, and your optional notes for sources you've pinned
- **Optional History**: Domain counts and hashed IDs (no chat text) - can be disabled

All data is stored locally on your device and never transmitted anywhere.

### Does SourceLens send data to external servers?

**No.** SourceLens is completely local:
- No analytics or telemetry
- No external API calls
- No data transmission
- All processing happens in your browser

### How do I delete my data?

You can delete your data at any time:
1. Open Settings (⚙️ icon in the panel)
2. Go to "Data Management"
3. Choose what to clear:
   - Clear Pins
   - Clear History
   - Clear Derived Caches
   - Clear All Data
   - Reset Everything

Uninstalling the extension also automatically deletes all data.

## Features

### Why don't some previews work?

Some websites block iframe embedding for security reasons using:
- X-Frame-Options header
- Content Security Policy (CSP)
- Frame-ancestors directive

This is a security feature of those websites, not a bug. When preview is blocked, you'll see a fallback message with options to:
- Open in a new tab
- Copy the link
- View the source

### How does the "Enhance Page" mode work?

Enhance Page mode injects inline glassmorphic cards directly under assistant messages in the ChatGPT interface. It also collapses the raw source citations for a cleaner look. You can toggle it on/off with `Cmd/Ctrl+Shift+E`.

### How do I use keyboard shortcuts?

- `Cmd/Ctrl+Shift+E` - Toggle Enhance Page mode
- `Cmd/Ctrl+Shift+H` - Toggle highlight sources in chat
- `Cmd/Ctrl+K` - Open command palette
- `Escape` - Close modals/palette

### Can I export my pins?

Yes! You can export pins from the Pins tab:
1. Go to the Pins tab
2. Click the export button
3. Choose JSON or Markdown format
4. Save the file

### What is the Knowledge Panel?

The Knowledge Panel provides local-only insights about your search results:
- Top domains with diversity scores
- Source quality signals (docs-heavy, news-heavy, forum-heavy)
- Date hints and freshness indicators
- Suggested pins

All insights are computed locally - no data is sent anywhere.

## Troubleshooting

### The panel doesn't appear

1. Make sure you're on `chatgpt.com` or `chat.openai.com`
2. Refresh the page
3. Check that the extension is enabled in `chrome://extensions/`
4. Try toggling the panel with `Cmd/Ctrl+Shift+E`

### Sources aren't being detected

1. Make sure the assistant message contains source links
2. Try refreshing the page
3. Check if ChatGPT's DOM structure has changed (the extension may need an update)

### The extension stopped working after a ChatGPT update

ChatGPT occasionally updates their UI, which may break source detection. Please:
1. Check if there's an extension update available
2. Report the issue (see [SUPPORT.md](./SUPPORT.md))
3. The extension will be updated to support the new structure

### Preview shows "Preview Blocked"

This is normal! Some websites block iframe embedding for security. You can:
- Click "Open in new tab" to view the page
- Copy the link to share it
- The extension cannot bypass website security policies

### Settings aren't saving

1. Check that Chrome storage isn't full
2. Try clearing some data (Settings → Data Management)
3. Check browser console for errors (F12)

## Technical Questions

### Why does SourceLens need storage permission?

Storage permission is required to:
- Save your preferences (panel position, theme, etc.)
- Store pinned sources locally
- Maintain optional session history

All data stays on your device.

### Why does SourceLens need access to ChatGPT domains?

Host permissions are required to:
- Inject the results panel overlay on ChatGPT pages
- Extract source links from assistant messages
- Display the enhanced UI

The extension only works on `chatgpt.com` and `chat.openai.com` - it does not access any other websites.

### Is SourceLens open source?

Yes! SourceLens is open source. See the [repository](https://github.com/iamadi11/gpt-ui) for the source code.

### How do I report a bug?

Please see [SUPPORT.md](./SUPPORT.md) for how to report bugs and issues.

### How do I request a feature?

Please see [SUPPORT.md](./SUPPORT.md) for how to request features.

## Limitations

### Known Limitations

1. **DOM dependency**: Source detection depends on ChatGPT's DOM structure. If ChatGPT updates their UI, the extension may need an update.

2. **Preview blocking**: Some websites block iframe embedding (X-Frame-Options/CSP). This is a security feature, not a bug.

3. **Single domain**: The extension only works on ChatGPT domains. It does not work on other AI chat interfaces.

4. **No chat text storage**: The extension does not store chat text, so it cannot provide search across past conversations.

### Future Enhancements

Potential future features (not currently implemented):
- Support for other AI chat interfaces
- Search across pinned sources
- Custom themes
- More export formats

## Still Have Questions?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- See [SUPPORT.md](./SUPPORT.md) for how to get help
- Review [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for privacy details
- Check [PERMISSIONS.md](./PERMISSIONS.md) for permission explanations

---

**Last updated:** 2024-XX-XX

