#!/usr/bin/env node

/**
 * Package extension for Chrome Web Store release
 * Creates a zip file with only the necessary dist files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const RELEASE_DIR = path.join(__dirname, '..', 'release');

// Read version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
);
const version = packageJson.version;

// Ensure release directory exists
if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR, { recursive: true });
}

// Create zip file name
const zipFileName = `SourceLens-v${version}.zip`;
const zipPath = path.join(RELEASE_DIR, zipFileName);

// Remove old zip if it exists
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Files to include in the zip
const filesToInclude = [
  'manifest.json',
  'content.js',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
];

console.log(`📦 Packaging SourceLens v${version}...`);

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Error: dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Check if required files exist
const missingFiles = filesToInclude.filter(file => {
  const filePath = path.join(DIST_DIR, file);
  return !fs.existsSync(filePath);
});

if (missingFiles.length > 0) {
  console.error('❌ Error: Missing required files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

try {
  // Create zip using zip command (macOS/Linux) or PowerShell (Windows)
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // Windows: Use PowerShell Compress-Archive
    const filesToZip = filesToInclude.map(file => `"${path.join(DIST_DIR, file).replace(/\\/g, '/')}"`).join(',');
    execSync(
      `powershell -Command "Compress-Archive -Path ${filesToZip.split(',').map(f => path.join(DIST_DIR, filesToInclude[filesToInclude.indexOf(f.split(path.sep).pop())]).replace(/\\/g, '/')).join(',')} -DestinationPath "${zipPath.replace(/\\/g, '/')}" -Force"`,
      { cwd: DIST_DIR, stdio: 'inherit' }
    );
  } else {
    // macOS/Linux: Use zip command
    execSync(
      `cd "${DIST_DIR}" && zip -r "${zipPath}" ${filesToInclude.join(' ')}`,
      { stdio: 'inherit' }
    );
  }
  
  console.log(`✅ Package created: ${zipPath}`);
  console.log(`📄 File size: ${(fs.statSync(zipPath).size / 1024).toFixed(2)} KB`);
  console.log(`\n🚀 Ready to upload to Chrome Web Store!`);
} catch (error) {
  console.error('❌ Error creating zip:', error.message);
  process.exit(1);
}

