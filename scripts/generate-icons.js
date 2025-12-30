#!/usr/bin/env node

/**
 * Generate extension icons automatically
 * Creates PNG icons with a search emoji on a blue background
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const iconDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error('Error: sharp is required to generate icons.');
  console.error('Please install it: npm install --save-dev sharp');
  process.exit(1);
}

// Create SVG template for each size
const createSVGIcon = (size) => {
  const fontSize = Math.round(size * 0.5);
  const emoji = '🔍';
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1a73e8" rx="${Math.round(size * 0.15)}"/>
  <text x="50%" y="50%" font-size="${fontSize}px" text-anchor="middle" dominant-baseline="central" fill="white" font-family="Arial, sans-serif">${emoji}</text>
</svg>`;
};

// Generate icons
async function generateIcons() {
  console.log('Generating extension icons...\n');

  for (const size of sizes) {
    const svg = createSVGIcon(size);
    const pngPath = path.join(iconDir, `icon${size}.png`);
    
    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(pngPath);
      console.log(`✓ Created icon${size}.png (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to create icon${size}.png:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✓ All icons generated successfully!');
  console.log(`Icons are in: ${iconDir}`);
}

generateIcons().catch((error) => {
  console.error('Error generating icons:', error);
  process.exit(1);
});
