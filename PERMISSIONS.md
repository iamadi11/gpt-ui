# Permissions Explanation

SourceLens requests the following permissions, each explained below:

## Storage Permission

**Permission:** `"storage"`

**Why it's needed:**
- To save your preferences (panel position, default view, theme settings)
- To store pinned sources locally
- To maintain optional session history (if enabled)

**What it allows:**
- Saving data to Chrome's `chrome.storage.local` API
- Data is stored only on your device
- Data is never transmitted to external servers

**What it does NOT allow:**
- Access to your browsing history
- Access to other websites' data
- Transmission of data to external servers

## Host Permissions

**Permissions:** 
- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

**Why it's needed:**
- To inject the results panel overlay on ChatGPT pages
- To extract and display search results from assistant messages

**What it allows:**
- Running the extension's content script on these specific domains only
- Reading the DOM structure to detect and extract source links
- Injecting the results panel UI in a Shadow DOM (isolated from ChatGPT's UI)

**What it does NOT allow:**
- Access to any other websites
- Access to your browsing history on other sites
- Access to data from other Chrome tabs
- Network requests to external domains

## What SourceLens Does NOT Request

SourceLens explicitly does NOT request:

- ❌ `<all_urls>` - We only need access to ChatGPT domains
- ❌ `tabs` - We don't need to access other tabs
- ❌ `history` - We don't access browsing history
- ❌ `bookmarks` - We don't access bookmarks
- ❌ `downloads` - We don't manage downloads
- ❌ `notifications` - We don't send notifications
- ❌ `camera` or `microphone` - We don't access media
- ❌ `geolocation` - We don't access location data
- ❌ `activeTab` - Not needed (we use host permissions)

## Privacy Guarantee

All permissions are used exclusively for the extension's core functionality. We do not:
- Collect analytics or telemetry
- Send data to external servers
- Access data beyond what's necessary for the extension to function
- Store chat conversation text or personal information

## Questions?

If you have questions about why a specific permission is needed, please refer to our [Privacy Policy](./PRIVACY_POLICY.md) or open an issue on our repository.

