# Visual QA Rubric

This document provides a comprehensive checklist for visual and functional quality assurance before releasing SourceLens to the Chrome Web Store.

## Readability & Contrast

### Text Readability
- [ ] All text is readable against background colors
- [ ] Text contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] Text is readable in both light and dark themes
- [ ] Font sizes are appropriate (minimum 12px for body text)
- [ ] Text doesn't blend into glassmorphic backgrounds

### Color Contrast
- [ ] Primary text has sufficient contrast
- [ ] Secondary text is distinguishable but not too faint
- [ ] Links are clearly distinguishable from regular text
- [ ] Button text is readable on all button states
- [ ] Error/warning messages are clearly visible

## Glassmorphism & Visual Effects

### Glass Transparency
- [ ] Glass effect is visible but doesn't obscure content
- [ ] Backdrop blur is appropriate (not too strong, not too weak)
- [ ] Background opacity allows content to be readable
- [ ] Glass effect works in both light and dark themes
- [ ] Glass intensity settings work correctly (subtle/normal/strong)

### Frosted Gradient Overlays
- [ ] Frosted overlays enhance depth without being distracting
- [ ] Gradient overlays are subtle and professional
- [ ] Frost style options work correctly (classic/minimal)
- [ ] Noise texture (if enabled) is subtle and not distracting
- [ ] Overlays don't interfere with text readability

### Visual Consistency
- [ ] Glass effects are consistent across all panels and cards
- [ ] Frosted overlays are applied consistently
- [ ] Visual effects don't cause performance issues
- [ ] Effects work on different screen sizes

## Interaction & UX

### Hover States
- [ ] All interactive elements have clear hover states
- [ ] Hover states provide visual feedback
- [ ] Hover states don't cause layout shifts
- [ ] Preview hover-to-enlarge works smoothly
- [ ] Popovers appear in correct positions

### Click/Tap Interactions
- [ ] All buttons respond to clicks
- [ ] Links open correctly (new tab, same tab as appropriate)
- [ ] Toggle switches work smoothly
- [ ] Checkboxes and radio buttons are clearly interactive
- [ ] No accidental clicks on non-interactive elements

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Keyboard shortcuts work as documented
- [ ] Escape key closes modals/popovers

### Loading States
- [ ] Loading indicators are visible when needed
- [ ] Loading states don't block the UI
- [ ] Error states are clearly communicated
- [ ] Empty states are helpful and informative

## Responsiveness

### Panel Positioning
- [ ] Panel works correctly on right side
- [ ] Panel works correctly on left side
- [ ] Panel resizes smoothly
- [ ] Panel doesn't overlap with ChatGPT UI
- [ ] Panel respects safe insets (doesn't block composer)

### Popover Positioning
- [ ] Preview popovers position correctly
- [ ] Popovers never block the composer
- [ ] Popovers adjust position to stay in viewport
- [ ] Popovers work on different screen sizes
- [ ] Popovers close when clicking outside

### Mobile/Tablet Considerations
- [ ] Extension works on different screen sizes
- [ ] Text is readable on smaller screens
- [ ] Touch targets are appropriately sized
- [ ] Panels don't overflow viewport

## Performance

### Initial Load
- [ ] Extension loads quickly
- [ ] No visible lag when opening panel
- [ ] No flash of unstyled content
- [ ] Icons and images load correctly

### Runtime Performance
- [ ] Panel opens/closes smoothly
- [ ] Scrolling is smooth
- [ ] No janky animations
- [ ] Preview iframes load efficiently
- [ ] No memory leaks (check with DevTools)

### Resource Usage
- [ ] Extension doesn't slow down ChatGPT
- [ ] No excessive CPU usage
- [ ] No excessive memory usage
- [ ] Network requests are minimal (only for previews)

## Cleanup & Reversibility

### Toggle OFF Behavior
- [ ] All injected DOM nodes are removed
- [ ] All injected styles are removed
- [ ] All event listeners are disconnected
- [ ] All MutationObservers are disconnected
- [ ] ChatGPT UI returns to original state

### No Permanent Changes
- [ ] Extension doesn't modify ChatGPT's original DOM
- [ ] Extension doesn't add permanent styles
- [ ] Extension doesn't leave orphaned nodes
- [ ] Extension doesn't cause memory leaks

### Clean Uninstall
- [ ] Uninstalling removes all injected nodes
- [ ] Uninstalling removes all injected styles
- [ ] No console errors after uninstall
- [ ] ChatGPT UI is completely restored

## Privacy & Security

### Data Handling
- [ ] No chat text is stored (verify in storage)
- [ ] Only allowed data is stored (pins, settings, optional history)
- [ ] Clear data buttons work correctly
- [ ] Data is cleared on uninstall

### Permissions
- [ ] Only minimal permissions are requested
- [ ] Permissions are clearly justified
- [ ] No unnecessary permissions

### Security
- [ ] No eval() or unsafe code execution
- [ ] No remote script loading
- [ ] CSP is properly configured
- [ ] Iframe sandboxing is correct

## Browser Compatibility

### Chrome
- [ ] Works on latest Chrome version
- [ ] Works on Chrome stable
- [ ] Works on Chrome beta (if applicable)
- [ ] No console errors

### Manifest V3
- [ ] Extension uses Manifest V3
- [ ] All APIs are MV3 compatible
- [ ] No deprecated APIs
- [ ] Content scripts work correctly

## Store Readiness

### Assets
- [ ] Icons are present (16, 32, 48, 128)
- [ ] Screenshots are prepared (at least 1, ideally 3-5)
- [ ] Screenshots show key features
- [ ] No sensitive data in screenshots

### Documentation
- [ ] README is up to date
- [ ] Privacy Policy is complete
- [ ] Permissions are explained
- [ ] FAQ covers common questions
- [ ] Troubleshooting guide is available

### Versioning
- [ ] Version numbers are synced (package.json, manifest.json)
- [ ] Changelog is up to date
- [ ] Release notes are prepared

## Testing Checklist

### Manual Testing
- [ ] Test on fresh install
- [ ] Test with existing data
- [ ] Test all features
- [ ] Test error scenarios
- [ ] Test edge cases

### Automated Testing
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build completes successfully

### Store Submission
- [ ] Package zip is created correctly
- [ ] Zip contains only necessary files
- [ ] Manifest is valid
- [ ] No errors in Chrome Web Store validator

## Sign-Off

Before submitting to Chrome Web Store:

- [ ] All critical items checked
- [ ] All high-priority items checked
- [ ] At least 80% of items checked
- [ ] No blocking issues
- [ ] Ready for review

**Reviewed by:** _______________  
**Date:** _______________  
**Version:** _______________

---

**Last updated:** 2024-XX-XX

