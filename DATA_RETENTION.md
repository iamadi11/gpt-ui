# Data Retention Policy

This document outlines how SourceLens handles data retention, limits, and user controls.

## Data Storage Limits

SourceLens implements reasonable limits to prevent excessive storage usage:

### Pins

- **Maximum pins**: No hard limit (browser storage limits apply)
- **Recommended**: Keep under 10,000 pins for optimal performance
- **Automatic cleanup**: Pins are never automatically deleted (user-controlled)
- **Storage impact**: Each pin stores: URL, title, domain, tags, notes, timestamps (~1-2 KB per pin)

### Session History

- **Maximum sessions**: 500 sessions (older sessions are automatically removed)
- **Maximum entries per session**: 1000 result entries
- **Automatic cleanup**: When the limit is reached, oldest sessions are removed (FIFO)
- **Storage impact**: Each session stores: domain counts, hashed IDs, timestamps (~5-10 KB per session)

### URL Metadata Cache

- **Maximum entries**: 200 entries (LRU - Least Recently Used eviction)
- **Automatic cleanup**: When the limit is reached, least recently used entries are removed
- **Storage impact**: Each entry stores: URL, title, domain (~1 KB per entry)

### Settings

- **No limit**: Settings are minimal and do not have storage limits
- **Storage impact**: ~5-10 KB total

## Data Retention Periods

### User-Controlled Data

- **Pins**: Retained until user manually deletes them or clears all data
- **History**: Retained until user manually deletes them, clears history, or reaches the 500 session limit
- **Settings**: Retained until user resets settings or clears all data

### Automatic Cleanup

- **URL Cache**: Automatically managed via LRU eviction (200 entry limit)
- **Session History**: Automatically managed via FIFO eviction (500 session limit)
- **No automatic deletion of user data**: Pins and settings are never automatically deleted

## User Controls

Users have full control over their data:

### Clear Individual Data Types

1. **Clear Pins**: Settings → Data Management → Clear Pins
   - Removes all pinned sources
   - Does not affect history or settings

2. **Clear History**: Settings → Data Management → Clear History
   - Removes all session history
   - Does not affect pins or settings

3. **Clear Derived Caches**: Settings → Data Management → Clear Derived Caches
   - Removes URL metadata cache
   - Does not affect pins, history, or settings

### Clear All Data

- **Clear All Data**: Settings → Data Management → Clear All Data
  - Removes pins, history, and caches
  - Preserves settings

### Complete Reset

- **Reset Everything**: Settings → Data Management → Reset Everything
  - Removes all data including settings
  - Complete reset to default state

### Disable History

- **Disable History**: Settings → Enable session history (uncheck)
  - Prevents new history entries from being created
  - Does not delete existing history (use Clear History to delete)

## Uninstall Behavior

When the extension is uninstalled:

- **All data is automatically deleted**: Chrome automatically clears extension storage on uninstall
- **No data remains**: All pins, history, settings, and caches are removed
- **No recovery**: Data cannot be recovered after uninstall (unless reinstall happens before Chrome clears storage)

## Data Export

Users can export their data before clearing:

- **Export Pins**: Export pins as JSON or Markdown from the Pins tab
- **Export Results**: Export visible results as JSON or Markdown from the Results tab
- **Manual backup**: Users can manually copy exported data before clearing

## Storage Usage Estimation

Typical storage usage:

- **Minimal usage** (10 pins, 10 sessions): ~50-100 KB
- **Moderate usage** (100 pins, 50 sessions): ~200-500 KB
- **Heavy usage** (1000 pins, 200 sessions): ~1-2 MB
- **Maximum usage** (10,000 pins, 500 sessions): ~10-20 MB

Chrome extension storage limit: ~10 MB per extension (may vary by browser)

## Best Practices

1. **Regular cleanup**: Periodically review and remove unused pins
2. **Export before clearing**: Export important pins before clearing data
3. **Disable history if not needed**: Disable session history if you don't need it
4. **Monitor storage**: Use Chrome's extension storage viewer to monitor usage

## Privacy Considerations

- **No data transmission**: All data remains on your device
- **No external storage**: Data is never sent to external servers
- **User control**: You have complete control over data retention
- **Automatic limits**: Limits prevent excessive storage usage

## Questions?

If you have questions about data retention or storage limits, please see:
- [Privacy Policy](./PRIVACY_POLICY.md)
- [Support](./SUPPORT.md)
- [FAQ](./FAQ.md)

---

**Last updated:** 2024-XX-XX

