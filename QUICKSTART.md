# Quick Start Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Generate Icons

Icons are generated automatically:

```bash
npm run generate-icons
```

This creates three PNG icons in `public/icons/` with a search emoji on a blue background.

If you prefer custom icons, you can replace the generated files with your own.

## 3. Build

```bash
npm run build
```

This creates the `dist/` folder.

## 4. Load Extension

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

## 5. Test

1. Go to `chatgpt.com` or `chat.openai.com`
2. Ask a question that returns sources (e.g., "What are recent AI developments?")
3. Look for the 🔍 toggle button (bottom-right)
4. Click it or press `Cmd/Ctrl+Shift+E` to open the panel

## Development

For development with watch mode:

```bash
npm run dev
```

This will rebuild automatically when you make changes. Reload the extension in Chrome after each build.

## Troubleshooting

**Build fails:**
- Make sure all dependencies are installed: `npm install`
- Check Node.js version (18+ required)

**Extension doesn't load:**
- Check `dist/` folder exists and has `manifest.json`
- Verify icons exist in `dist/icons/`
- Check browser console for errors

**No results detected:**
- Make sure the ChatGPT message has external links
- Check browser console for extraction errors
- Try a different prompt that typically returns sources

