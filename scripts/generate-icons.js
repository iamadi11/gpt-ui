#!/usr/bin/env node

/**
 * Generate extension icons automatically
 * Creates premium PNG icons with a sophisticated lens/magnifying glass design
 * Features gradients, shadows, and modern styling for a premium look
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

// Create premium SVG icon template for each size
const createSVGIcon = (size) => {
  const borderRadius = Math.round(size * 0.2);
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Scale factors for different elements
  const lensSize = size * 0.5;
  const handleLength = size * 0.25;
  const strokeWidth = Math.max(1.5, size * 0.08);
  const glowSize = size * 0.6;
  
  // Premium gradient colors - deep blue to purple
  const gradientId = `gradient-${size}`;
  const glowGradientId = `glow-${size}`;
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Premium background gradient -->
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4338ca;stop-opacity:1" />
    </linearGradient>
    
    <!-- Glow effect gradient -->
    <radialGradient id="${glowGradientId}" cx="50%" cy="50%">
      <stop offset="0%" style="stop-color:#818cf8;stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0" />
    </radialGradient>
    
    <!-- Shadow filter for depth -->
    <filter id="shadow-${size}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${size * 0.03}"/>
      <feOffset dx="0" dy="${size * 0.02}" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background with rounded corners and gradient -->
  <rect width="${size}" height="${size}" fill="url(#${gradientId})" rx="${borderRadius}"/>
  
  <!-- Subtle glow effect -->
  <circle cx="${centerX}" cy="${centerY}" r="${glowSize / 2}" fill="url(#${glowGradientId})" opacity="0.6"/>
  
  <!-- Lens/Magnifying glass -->
  <g filter="url(#shadow-${size})" transform="translate(${centerX}, ${centerY})">
    <!-- Glass circle with highlight -->
    <circle cx="0" cy="0" r="${lensSize / 2}" fill="none" stroke="white" stroke-width="${strokeWidth}" opacity="0.95"/>
    <circle cx="${-lensSize * 0.15}" cy="${-lensSize * 0.15}" r="${lensSize * 0.25}" fill="white" opacity="0.3"/>
    
    <!-- Inner glass reflection -->
    <ellipse cx="${-lensSize * 0.2}" cy="${-lensSize * 0.2}" rx="${lensSize * 0.15}" ry="${lensSize * 0.2}" fill="white" opacity="0.5"/>
    
    <!-- Handle -->
    <line 
      x1="${lensSize * 0.35}" 
      y1="${lensSize * 0.35}" 
      x2="${lensSize * 0.35 + handleLength}" 
      y2="${lensSize * 0.35 + handleLength}" 
      stroke="white" 
      stroke-width="${strokeWidth * 1.2}" 
      stroke-linecap="round"
      opacity="0.95"
    />
    
    <!-- Decorative sparkle/light rays (for premium feel) -->
    ${size >= 32 ? `
    <g opacity="0.6">
      <line x1="0" y1="${-lensSize * 0.4}" x2="0" y2="${-lensSize * 0.55}" stroke="white" stroke-width="${strokeWidth * 0.6}" stroke-linecap="round"/>
      <line x1="${lensSize * 0.4}" y1="0" x2="${lensSize * 0.55}" y2="0" stroke="white" stroke-width="${strokeWidth * 0.6}" stroke-linecap="round"/>
      <line x1="0" y1="${lensSize * 0.4}" x2="0" y2="${lensSize * 0.55}" stroke="white" stroke-width="${strokeWidth * 0.6}" stroke-linecap="round"/>
      <line x1="${-lensSize * 0.4}" y1="0" x2="${-lensSize * 0.55}" y2="0" stroke="white" stroke-width="${strokeWidth * 0.6}" stroke-linecap="round"/>
    </g>
    ` : ''}
  </g>
  
  <!-- Subtle border highlight for premium look -->
  <rect width="${size}" height="${size}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="${Math.max(0.5, size * 0.01)}" rx="${borderRadius}"/>
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
