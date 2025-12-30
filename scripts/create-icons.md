# Creating Extension Icons

The extension needs three icon files in `public/icons/`:

- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

## Quick Options

### Option 1: Use an Online Tool
1. Go to https://www.favicon-generator.org/ or similar
2. Upload a square image (at least 128x128)
3. Download the generated icons
4. Rename and place in `public/icons/`

### Option 2: Use ImageMagick (if installed)
```bash
# Create a simple colored square as base
convert -size 128x128 xc:#1a73e8 public/icons/icon128.png
convert -size 48x48 xc:#1a73e8 public/icons/icon48.png
convert -size 16x16 xc:#1a73e8 public/icons/icon16.png

# Or add text/emoji
convert -size 128x128 xc:#1a73e8 -pointsize 80 -fill white -gravity center -annotate +0+0 "🔍" public/icons/icon128.png
```

### Option 3: Use Any Image Editor
- Create a 128x128 image with a search icon or "GPT UI" text
- Export/resize to the three required sizes
- Save as PNG files in `public/icons/`

The icons don't need to be fancy - a simple colored square with an emoji or letter works fine for development.

