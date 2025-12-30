# Security Notes

This document outlines the security practices and considerations for SourceLens.

## Sandboxed Iframe Usage

SourceLens uses sandboxed iframes to preview web content safely:

- **Sandbox attributes**: Iframes are created with appropriate `sandbox` attributes to restrict capabilities
- **No script execution**: Preview iframes do not execute scripts from the embedded site
- **Isolated context**: Each preview is isolated from the extension's context and the ChatGPT page
- **X-Frame-Options handling**: The extension gracefully handles sites that block embedding via X-Frame-Options or CSP headers

### Preview Security Model

1. **Sandboxed iframe creation**: Previews are loaded in iframes with restricted permissions
2. **Fallback handling**: When embedding is blocked, the extension shows a fallback message instead of attempting to bypass security
3. **No cross-origin DOM access**: The extension does not attempt to access or manipulate content from embedded sites
4. **User-initiated navigation**: Users can choose to open previews in new tabs, which respects the site's security policies

## No Cross-Origin DOM Access

SourceLens does not access or manipulate DOM content from external websites:

- **Content script scope**: The extension's content script only runs on `chatgpt.com` and `chat.openai.com`
- **No external site access**: We do not inject scripts or access DOM on any other domains
- **Isolated extraction**: Source extraction happens only within the ChatGPT page context
- **No data exfiltration**: The extension does not send any data to external servers

## Reversible Injections

All page modifications are designed to be fully reversible:

### DOM Injections

- **Tracked nodes**: All injected DOM nodes are tracked and can be removed
- **Clean removal**: When the extension is disabled or toggled off, all injected nodes are removed
- **No permanent changes**: The extension does not modify ChatGPT's original DOM structure permanently
- **Observer cleanup**: MutationObservers are properly disconnected when the extension is disabled

### Style Injections

- **Scoped styles**: All injected styles are scoped to extension-specific classes and data attributes
- **Removable styles**: Style elements are tracked and can be removed
- **No global pollution**: Styles do not affect ChatGPT's UI unless explicitly scoped
- **Cleanup on disable**: All injected styles are removed when the extension is disabled

### Event Listeners

- **Tracked listeners**: Event listeners are tracked and can be removed
- **Proper cleanup**: All event listeners are removed when the extension is disabled
- **No memory leaks**: The extension ensures proper cleanup to prevent memory leaks

## Content Security Policy (CSP)

SourceLens adheres to Chrome Extension Manifest V3 CSP requirements:

- **No eval()**: The extension does not use `eval()` or similar dynamic code execution
- **No inline scripts**: All scripts are bundled and loaded from extension files
- **No remote scripts**: The extension does not load scripts from external sources
- **Strict CSP**: The manifest includes a strict CSP for extension pages

## Data Storage Security

- **Local storage only**: All data is stored locally using Chrome's `chrome.storage.local` API
- **No encryption needed**: Since data never leaves the device, encryption is not required for local storage
- **User control**: Users can clear all data at any time through settings
- **No sensitive data**: The extension does not store passwords, API keys, or other sensitive information

## Permissions Justification

All requested permissions are minimal and necessary:

- **storage**: Required to save user preferences and pinned sources locally
- **host_permissions (chatgpt.com, chat.openai.com)**: Required to inject the results panel on these specific domains only

The extension does NOT request:
- Access to other websites
- Browsing history
- Tabs API
- Notifications
- Camera or microphone
- Geolocation
- Any other unnecessary permissions

## Security Best Practices

1. **Regular updates**: Keep the extension updated to address any security vulnerabilities
2. **Code review**: All code changes are reviewed for security implications
3. **Minimal permissions**: Only request permissions that are absolutely necessary
4. **No external dependencies**: The extension minimizes external dependencies to reduce attack surface
5. **Input validation**: All user inputs and extracted data are validated before processing
6. **Error handling**: Errors are handled gracefully without exposing sensitive information

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Contact the maintainer directly (see [SUPPORT.md](./SUPPORT.md))
3. Provide details about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Security Updates

Security updates will be documented in the [CHANGELOG.md](./CHANGELOG.md) with appropriate severity indicators.

---

**Last updated:** 2024-XX-XX

