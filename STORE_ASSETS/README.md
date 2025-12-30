# Store Assets Guide

This directory contains assets needed for Chrome Web Store submission.

## Required Images

### Icons
Icons are generated via `npm run generate-icons` and stored in `public/icons/`:
- `icon16.png` (16x16px)
- `icon32.png` (32x32px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

### Screenshots (Required)

You need **at least 1 screenshot**, but 3-5 are recommended:

1. **Screenshot 1: Main Feature (1280x800px)**
   - Show the results panel open with search results
   - Title suggestion: "Visual Results Panel with Organized Source Cards"

2. **Screenshot 2: Preview Mode (1280x800px)**
   - Show split-panel preview in action
   - Title suggestion: "Split-Panel Preview Mode"

3. **Screenshot 3: Pinboard (1280x800px)**
   - Show the Pins tab with saved sources
   - Title suggestion: "Save and Organize Sources in Pinboard"

4. **Screenshot 4: Knowledge Panel (1280x800px)**
   - Show Knowledge Panel with insights
   - Title suggestion: "Local Knowledge Panel with Insights"

5. **Screenshot 5: Settings (1280x800px)**
   - Show settings modal with privacy controls
   - Title suggestion: "Privacy-First Settings and Controls"

### Small Promo Tile (Optional)
- **440x280px** - Small promotional image
- Use for promotional placements (not required)

## Screenshot Guidelines

### Content Guidelines
- Show the extension in action on chatgpt.com or chat.openai.com
- Highlight key features visually
- Keep it clean and uncluttered
- Use actual data (but ensure no sensitive information)

### Technical Guidelines
- Format: PNG or JPEG
- Size: Exactly 1280x800px (or 440x280px for promo)
- File size: Keep under 1MB per image
- Quality: High quality, readable text

### Privacy Considerations
- Blur or remove any personal information
- Don't show full URLs with sensitive parameters
- Use generic examples when possible

## How to Create Screenshots

1. **Set up the scene:**
   - Load SourceLens in Chrome
   - Navigate to chatgpt.com
   - Ask a question that generates sources
   - Open the results panel

2. **Capture the screenshot:**
   - Use Chrome's built-in screenshot tools
   - Or use a tool like Lightshot, Snagit, etc.
   - Ensure you capture the full viewport or crop to 1280x800

3. **Edit if needed:**
   - Crop to exact dimensions
   - Add annotations if helpful (arrows, labels)
   - Ensure text is readable
   - Verify no sensitive data

4. **Save:**
   - Save as PNG (preferred) or JPEG
   - Name descriptively: `screenshot-1-main-panel.png`

## Suggested Screenshot Descriptions

Copy these for the Chrome Web Store listing:

**Screenshot 1:**
"Visual results panel displays sources in organized cards with favicons, titles, and snippets. Easy to browse and filter results."

**Screenshot 2:**
"Split-panel preview mode lets you view web content directly in the panel while keeping the results list visible."

**Screenshot 3:**
"Pinboard feature allows you to save and organize sources into folders. Search, filter, and export your pins."

**Screenshot 4:**
"Knowledge Panel provides local-only insights: top domains, diversity scores, source quality signals, and date hints."

**Screenshot 5:**
"Privacy-first settings give you full control over data storage and clearing options. No external data transmission."

## Promotional Copy

### Tagline
"Privacy-first enhancement for AI chat interfaces"

### Short Promotional Text
"Transform AI chat search results into a visual, organized panel. Preview content, save sources, and get insights—all while keeping your data completely private and local."

## Checklist

Before submitting to Chrome Web Store:

- [ ] At least 1 screenshot (1280x800px)
- [ ] Icons generated and in dist/icons/
- [ ] Screenshots show key features
- [ ] No sensitive data in screenshots
- [ ] Screenshots are high quality and readable
- [ ] Descriptions prepared for each screenshot

## Notes

- Store these assets in version control or a separate folder
- Keep original editable versions if possible
- Update screenshots when UI changes significantly
- Consider creating a script to generate screenshots automatically (future enhancement)

---

**Remember:** Screenshots are one of the most important aspects of your store listing. Make them count!

