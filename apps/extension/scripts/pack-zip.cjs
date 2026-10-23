const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const zipFile = path.resolve(__dirname, '../dist/wordstreak-chrome-extension.zip');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run pnpm build first.');
  process.exit(1);
}

if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

try {
  execSync(`cd "${distDir}" && zip -r "${zipFile}" . -x "*.zip"`, { stdio: 'inherit' });
  console.log(`\n🎉 Chrome Extension packaged successfully: ${zipFile}\n`);
} catch (err) {
  console.error('Failed to create zip package:', err);
  process.exit(1);
}
