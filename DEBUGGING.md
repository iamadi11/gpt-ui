# Debugging Guide

If the extension isn't detecting search results, follow these steps:

## 1. Check Extension is Loaded

1. Open Chrome DevTools (F12)
2. Go to the **Console** tab
3. Look for messages starting with `[GPT-UI]`:
   - `[GPT-UI] Initializing extension...`
   - `[GPT-UI] Extension initialized successfully`

If you don't see these messages, the extension might not be loaded:
- Check `chrome://extensions/` - is the extension enabled?
- Reload the extension
- Reload the ChatGPT page

## 2. Check Toggle Button

Look for a blue circular button with a 🔍 icon in the bottom-right corner of the page.

- **If you see it**: The extension is running
- **If you don't see it**: Check the console for errors

## 3. Test Detection

1. Ask ChatGPT a question that typically returns sources, e.g.:
   - "What are the latest developments in AI?"
   - "Search for information about climate change"
   - "Find recent articles about TypeScript"

2. Wait for the response to complete

3. Check the console for:
   - `[GPT-UI] Found X assistant messages`
   - `[GPT-UI] Message 0: hasSearchResults=true/false`
   - `[GPT-UI] Found X results`

## 4. Common Issues

### No messages detected
- **Console shows**: `Found 0 assistant messages`
- **Fix**: ChatGPT's DOM structure may have changed. Check the console for what selectors are being tried.

### Messages found but no results
- **Console shows**: `hasSearchResults=false` for all messages
- **Fix**: The message might not have enough external links. Try a different prompt that explicitly asks for sources.

### Results found but panel doesn't show
- **Console shows**: `Found X results` but panel is hidden
- **Fix**: Click the toggle button (🔍) or press `Cmd/Ctrl+Shift+E`

## 5. Manual Testing

Open the browser console and run:

```javascript
// Check if extension is loaded
window.__gpt_ui_updateButton

// Manually trigger extraction (if extension exposes it)
// Or check the page for links:
document.querySelectorAll('a[href^="http"]').length
```

## 6. Report Issues

If the extension still doesn't work, check the console and note:
- What messages you see (or don't see)
- What ChatGPT page you're on (chatgpt.com or chat.openai.com)
- What prompt you tried
- Any error messages in red

## 7. Lower Detection Threshold

The extension now detects results if:
- Has "Sources"/"Citations" mentioned AND has external links, OR
- Has 2+ external links, OR  
- Has 1+ external link AND message is >300 characters

If you want to lower the threshold further, edit `src/content/selectors.ts` line 144.

