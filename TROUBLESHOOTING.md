# Troubleshooting Guide

Common issues and solutions for SourceLens.

## Panel Not Showing

**Symptoms:** The toggle button doesn't appear, or clicking it doesn't open the panel.

**Solutions:**
1. **Refresh the page** - ChatGPT's single-page app may need a refresh
2. **Check if extension is enabled:**
   - Go to `chrome://extensions/`
   - Ensure SourceLens is enabled
3. **Check console for errors:**
   - Press `F12` to open Developer Tools
   - Check the Console tab for errors
4. **Verify you're on the correct domain:**
   - SourceLens only works on `chatgpt.com` and `chat.openai.com`
   - Check the URL matches one of these domains
5. **Try reloading the extension:**
   - Go to `chrome://extensions/`
   - Click the reload icon on SourceLens

## No Results Detected

**Symptoms:** The panel opens but shows "No results found" even when sources are visible.

**Solutions:**
1. **Wait a moment** - Results may take a few seconds to appear after the message loads
2. **Check message format:**
   - SourceLens detects messages with external links
   - Ensure the assistant message contains clickable links to external sites
3. **Check if sources are links:**
   - SourceLens detects `<a href>` links
   - Plain text URLs may not be detected
4. **Refresh and try again** - Sometimes DOM changes require a page refresh
5. **Report the issue** - If links are clearly visible but not detected, please report this (see [SUPPORT.md](./SUPPORT.md))

## Preview Not Working

**Symptoms:** Clicking "Preview" shows "Preview unavailable (site blocks embedding)."

**Explanation:** This is **expected behavior**, not a bug. Many websites use X-Frame-Options or CSP `frame-ancestors` headers to prevent embedding for security reasons (clickjacking protection).

**Solutions:**
1. **Use "Open in new tab"** - Click the "Open" button instead
2. **This is a security feature** - The website is intentionally blocking embedding
3. **Try a different result** - Some sites allow embedding, others don't

## Performance Issues

**Symptoms:** Extension causes lag or typing delays in ChatGPT.

**Solutions:**
1. **Disable auto-open panel:**
   - Settings → Uncheck "Auto-open panel when sources detected"
2. **Reduce snippet length:**
   - Settings → Lower "Snippet Length" slider
3. **Disable history:**
   - Settings → Uncheck "Enable session history"
4. **Clear cache:**
   - Settings → Privacy Controls → Clear Derived Caches
5. **Report if persistent** - If issues continue, please report (see [SUPPORT.md](./SUPPORT.md))

## Pins Not Saving

**Symptoms:** Pinned items disappear or don't save.

**Solutions:**
1. **Check storage quota:**
   - Go to `chrome://extensions/` → SourceLens → Details
   - Check "Storage" section for quota usage
2. **Clear old pins:**
   - Settings → Privacy Controls → Clear Pins
   - Then try pinning again
3. **Check browser storage:**
   - Ensure Chrome isn't in private/incognito mode (extensions have limited storage)
4. **Reload extension:**
   - Go to `chrome://extensions/` → Click reload on SourceLens

## Settings Not Saving

**Symptoms:** Settings revert after closing the panel or refreshing.

**Solutions:**
1. **Ensure storage permission:**
   - Go to `chrome://extensions/` → SourceLens → Details
   - Check that "Storage" permission is granted
2. **Check for storage errors:**
   - Open Console (`F12`)
   - Look for storage-related errors
3. **Try resetting:**
   - Settings → Privacy Controls → Reset Everything
   - Then reconfigure settings

## Keyboard Shortcuts Not Working

**Symptoms:** Keyboard shortcuts don't trigger actions.

**Solutions:**
1. **Check focus:**
   - Ensure ChatGPT input is not focused when using shortcuts
   - Try clicking elsewhere on the page first
2. **Check for conflicts:**
   - Other extensions or ChatGPT itself may use the same shortcuts
   - Try different shortcuts in Settings (if available)
3. **Browser compatibility:**
   - Ensure you're using Chrome or Chromium-based browser
   - Some browsers may not support all keyboard shortcuts

## Theme Not Matching

**Symptoms:** Panel theme doesn't match ChatGPT's theme.

**Solutions:**
1. **Refresh the page** - Theme detection runs on page load
2. **Check ChatGPT theme:**
   - Ensure ChatGPT is in light or dark mode (not a custom theme)
3. **Toggle ChatGPT theme:**
   - Change ChatGPT's theme and refresh
   - Panel should update automatically

## Results Look Wrong

**Symptoms:** Results are missing information or formatting is incorrect.

**Solutions:**
1. **Check DOM structure:**
   - ChatGPT's UI may have changed
   - SourceLens uses resilient selectors, but major UI changes may require an update
2. **Check console for errors:**
   - Press `F12` → Console tab
   - Look for extraction errors
3. **Report the issue** - Please report with details (see [SUPPORT.md](./SUPPORT.md))

## Reset Everything

If you want to start fresh:

1. **Clear all data:**
   - Settings → Privacy Controls → Reset Everything
2. **Uninstall and reinstall:**
   - Go to `chrome://extensions/`
   - Remove SourceLens
   - Reload the extension or reinstall from store

## Still Having Issues?

If none of the above solutions work:

1. **Check the Console:**
   - Press `F12` → Console tab
   - Look for error messages
   - Note any error messages you see

2. **Gather information:**
   - Chrome version
   - SourceLens version (shown in About section)
   - Steps to reproduce the issue

3. **Report the issue:**
   - See [SUPPORT.md](./SUPPORT.md) for how to report bugs
   - Include the information gathered above

## Performance Tips

- **Disable unnecessary features** if experiencing performance issues
- **Clear cache periodically** to free up storage
- **Use grouped view** for better performance with many results
- **Limit session history** if you have many sessions

---

For more help, see [SUPPORT.md](./SUPPORT.md) or open an issue on the repository.

