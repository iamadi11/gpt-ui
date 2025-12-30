# Compliance Checklist

This checklist ensures SourceLens is ready for Chrome Web Store submission and complies with all policies.

## Data Handling

- [x] **No external API calls** - All processing happens locally
- [x] **No analytics/telemetry** - Zero data collection
- [x] **No chat text storage** - We never save prompts or responses
- [x] **No personal information** - Only URLs, titles, domains (public data)
- [x] **Local-only storage** - All data stored via `chrome.storage.local`
- [x] **Clear data options** - Users can clear all data anytime
- [x] **Privacy policy** - Comprehensive policy document exists

## Storage

- [x] **Only necessary data** - Settings, pinned URLs, optional history metadata
- [x] **No chat conversation text** - Verified in codebase
- [x] **No account data** - We don't access ChatGPT account info
- [x] **LRU cache limits** - Max 200 cached entries
- [x] **Pin limits** - Max 2000 pins
- [x] **History limits** - Max 50 sessions

## Permissions

- [x] **Minimal permissions** - Only `storage` permission
- [x] **Specific host permissions** - Only chatgpt.com and chat.openai.com
- [x] **No broad permissions** - No `<all_urls>`, `tabs`, `history`, etc.
- [x] **Permission rationale** - Documented in PERMISSIONS.md
- [x] **User control** - Users can disable/uninstall anytime

## Manifest V3 Compliance

- [x] **manifest_version: 3** - Using MV3
- [x] **Content scripts properly declared** - Matches only ChatGPT domains
- [x] **CSP compliant** - Default safe CSP, no eval
- [x] **No remote code** - All code bundled locally
- [x] **Icons present** - 16, 32, 48, 128px icons
- [x] **Description provided** - Clear, concise description
- [x] **Version format** - Semantic versioning (X.Y.Z)

## User Experience

- [x] **Keyboard accessible** - All controls keyboard navigable
- [x] **Focus management** - Proper focus handling
- [x] **ARIA labels** - Accessibility labels on interactive elements
- [x] **Error handling** - Graceful error handling
- [x] **No interference** - Doesn't break ChatGPT typing/scrolling
- [x] **Shadow DOM isolation** - UI isolated from host page

## Security

- [x] **No eval()** - No dynamic code execution
- [x] **No innerHTML injection** - Safe HTML handling (except for highlighted keywords)
- [x] **Sandboxed iframes** - Preview uses proper sandbox attributes
- [x] **No XSS vectors** - Input sanitization where needed
- [x] **Referrer policy** - `no-referrer` for preview iframes

## Content Policy

- [x] **Single purpose** - Enhances ChatGPT results viewing
- [x] **No deceptive practices** - Clear about functionality
- [x] **No unauthorized use** - Only works on intended domains
- [x] **No content modification** - Doesn't modify ChatGPT content, only adds overlay

## Third-Party Code

- [x] **License compatibility** - All dependencies are MIT-compatible
- [x] **Attribution** - License file included
- [x] **No prohibited code** - No obfuscated or minified vendor code issues
- [x] **Dependency audit** - Dependencies are maintained and secure

## Privacy Policy & Documentation

- [x] **Privacy policy** - Comprehensive PRIVACY_POLICY.md
- [x] **Permissions explanation** - PERMISSIONS.md document
- [x] **User documentation** - README.md with usage guide
- [x] **Troubleshooting** - TROUBLESHOOTING.md
- [x] **Support information** - SUPPORT.md

## Store Listing

- [x] **Store listing copy** - STORE_LISTING.md created
- [x] **Screenshots prepared** - Instructions in STORE_ASSETS/README.md
- [x] **Category selected** - Productivity
- [x] **Keywords identified** - Relevant keywords listed

## Packaging

- [x] **Build script** - `npm run build` produces deterministic dist/
- [x] **Package script** - `npm run package` creates release zip
- [x] **Version sync** - package.json and manifest.json versions sync
- [x] **Version bumping** - Scripts for version management
- [x] **Changelog** - CHANGELOG.md maintained

## Testing

- [x] **Unit tests** - Tests for core utilities
- [x] **Manual testing** - Core features tested
- [x] **Browser compatibility** - Works in Chrome/Chromium
- [x] **Error scenarios** - Error handling tested
- [x] **Performance** - No performance regressions

## Code Quality

- [x] **TypeScript** - Strongly typed codebase
- [x] **Code comments** - Important sections commented
- [x] **Modular structure** - Well-organized codebase
- [x] **No console errors** - Clean console output

## Final Checks

- [ ] **Test on clean Chrome profile** - Verify fresh install works
- [ ] **Review store listing copy** - Final review of STORE_LISTING.md
- [ ] **Screenshot preparation** - Create/store screenshots
- [ ] **Privacy policy review** - Legal review if needed
- [ ] **Submit for review** - Upload to Chrome Web Store

---

**Last Updated:** [Date]
**Status:** Ready for Review ✅

