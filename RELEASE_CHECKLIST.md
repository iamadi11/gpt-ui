# Release Checklist

Use this checklist before submitting SourceLens to the Chrome Web Store.

## Pre-Release

### Code Quality
- [ ] Run `npm run lint` (or equivalent) - no errors
- [ ] Run `npm test` - all tests pass
- [ ] Fix any TypeScript errors
- [ ] Review code for security issues
- [ ] Check for console errors/warnings

### Version Management
- [ ] Update version in `package.json` using `npm run bump:patch|minor|major`
- [ ] Verify version is synced in `manifest.json`
- [ ] Update `CHANGELOG.md` with new changes
- [ ] Tag release in git (optional but recommended)

### Documentation
- [ ] Update `README.md` if needed
- [ ] Update `CHANGELOG.md` with release notes
- [ ] Verify `PRIVACY_POLICY.md` is current
- [ ] Verify `PERMISSIONS.md` is current
- [ ] Verify `FAQ.md` covers common questions
- [ ] Check all documentation links work

## Build & Package

### Build
- [ ] Run `npm run build` - successful build
- [ ] Verify `dist/` folder contains all required files:
  - [ ] `manifest.json`
  - [ ] `content.js`
  - [ ] `content.css` (if applicable)
  - [ ] `icons/icon16.png`
  - [ ] `icons/icon32.png`
  - [ ] `icons/icon48.png`
  - [ ] `icons/icon128.png`
- [ ] Verify no sourcemaps in production build
- [ ] Verify build size is reasonable (< 5MB recommended)

### Package
- [ ] Run `npm run package` - creates zip in `release/`
- [ ] Verify zip file name: `SourceLens-vX.Y.Z.zip`
- [ ] Verify zip contains only necessary files
- [ ] Verify zip size is reasonable
- [ ] Test loading zip as unpacked extension

## Manual Testing

### Basic Functionality
- [ ] Extension loads without errors
- [ ] Panel opens/closes correctly
- [ ] Sources are detected and displayed
- [ ] Results are organized correctly
- [ ] Preview mode works (when sites allow)
- [ ] Pins functionality works
- [ ] Settings save and load correctly

### Enhance Page Mode
- [ ] Toggle Enhance Page mode on/off
- [ ] Inline cards appear under messages
- [ ] Sources are collapsed when enabled
- [ ] Toggle OFF removes all injected nodes
- [ ] Toggle OFF removes all injected styles
- [ ] ChatGPT UI returns to original state

### Keyboard Shortcuts
- [ ] `Cmd/Ctrl+Shift+E` toggles Enhance Page mode
- [ ] `Cmd/Ctrl+Shift+H` toggles highlights
- [ ] `Cmd/Ctrl+K` opens command palette
- [ ] `Escape` closes modals/palette

### Privacy & Data
- [ ] Verify no chat text is stored
- [ ] Test "Clear Pins" button
- [ ] Test "Clear History" button
- [ ] Test "Clear All Data" button
- [ ] Test "Reset Everything" button
- [ ] Verify data is cleared on uninstall

### Edge Cases
- [ ] Test with no sources detected
- [ ] Test with many sources (100+)
- [ ] Test with preview blocked sites
- [ ] Test with very long titles/snippets
- [ ] Test with special characters in URLs
- [ ] Test panel on different screen sizes

## Store Assets

### Icons
- [ ] All icons present (16, 32, 48, 128)
- [ ] Icons are clear and recognizable
- [ ] Icons match extension branding

### Screenshots
- [ ] At least 1 screenshot (1280x800px)
- [ ] Ideally 3-5 screenshots showing key features
- [ ] Screenshots are high quality
- [ ] No sensitive data in screenshots
- [ ] Screenshots show extension in action

### Store Listing
- [ ] Title is correct (SourceLens)
- [ ] Short description is within 132 characters
- [ ] Long description is complete
- [ ] Category is selected (Productivity)
- [ ] Keywords are appropriate
- [ ] Privacy policy URL is set (if hosted)

## Permissions Review

### Verify Permissions
- [ ] Only `storage` permission requested
- [ ] Only `chatgpt.com/*` and `chat.openai.com/*` host permissions
- [ ] No unnecessary permissions
- [ ] Permissions are justified in documentation

### Privacy Compliance
- [ ] Privacy policy is complete
- [ ] Permissions are explained
- [ ] Data handling is documented
- [ ] No data collection or telemetry

## Security Review

### Code Security
- [ ] No `eval()` or unsafe code execution
- [ ] No remote script loading
- [ ] CSP is properly configured
- [ ] Iframe sandboxing is correct
- [ ] No cross-origin DOM access

### Data Security
- [ ] No sensitive data stored
- [ ] No data transmission
- [ ] Local storage only
- [ ] User controls for data deletion

## Final Checks

### Visual QA
- [ ] Review [VISUAL_QA_RUBRIC.md](./VISUAL_QA_RUBRIC.md)
- [ ] Check readability and contrast
- [ ] Verify glassmorphism effects
- [ ] Test interactions and hover states
- [ ] Verify responsiveness

### Performance
- [ ] Extension loads quickly
- [ ] No performance issues
- [ ] No memory leaks
- [ ] Smooth animations

### Browser Compatibility
- [ ] Works on latest Chrome
- [ ] Works on Chrome stable
- [ ] Manifest V3 compatible
- [ ] No deprecated APIs

## Store Submission

### Upload
- [ ] Zip file is ready (`release/SourceLens-vX.Y.Z.zip`)
- [ ] Store listing is complete
- [ ] Screenshots are uploaded
- [ ] Privacy policy is accessible
- [ ] All required fields filled

### Review Preparation
- [ ] Extension description is clear
- [ ] Permissions are justified
- [ ] Privacy policy is linked
- [ ] Support information is provided
- [ ] No policy violations

## Post-Release

### Monitor
- [ ] Monitor for user feedback
- [ ] Watch for bug reports
- [ ] Check Chrome Web Store reviews
- [ ] Monitor error reports (if applicable)

### Documentation
- [ ] Update release notes if needed
- [ ] Update FAQ if common questions arise
- [ ] Document any known issues

## Rollback Plan

If issues are found after release:

- [ ] Know how to unpublish extension
- [ ] Have previous version ready
- [ ] Have hotfix process ready
- [ ] Communication plan for users

## Sign-Off

**Ready for Release:**
- [ ] All critical items checked
- [ ] All high-priority items checked
- [ ] No blocking issues
- [ ] Team sign-off (if applicable)

**Prepared by:** _______________  
**Date:** _______________  
**Version:** _______________  
**Release Type:** Patch / Minor / Major

---

## Quick Reference

### Version Bump Commands
```bash
npm run bump:patch  # 3.1.0 → 3.1.1
npm run bump:minor  # 3.1.0 → 3.2.0
npm run bump:major  # 3.1.0 → 4.0.0
```

### Build Commands
```bash
npm run build    # Build extension
npm run package  # Create release zip
npm test         # Run tests
```

### File Locations
- Build output: `dist/`
- Release zip: `release/SourceLens-vX.Y.Z.zip`
- Icons: `dist/icons/`
- Manifest: `dist/manifest.json`

---

**Last updated:** 2024-XX-XX

