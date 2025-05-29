// This script generates PWA icons
// Run: node scripts/generate-pwa-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3b82f6"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" font-weight="bold" text-anchor="middle" fill="white">Q</text>
</svg>`;

// Save SVG icon
fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), svgIcon);

console.log('Icon created! For production, replace with professional icons:');
console.log('- /public/icon-192.png (192x192)');
console.log('- /public/icon-512.png (512x512)');
console.log('- /public/icon-maskable.png (512x512 with padding)');
console.log('\nYou can use tools like:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://maskable.app/');