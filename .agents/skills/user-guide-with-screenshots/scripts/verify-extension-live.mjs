import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const extensionPath = path.join(rootDir, 'apps/extension/dist');

async function testExtension() {
  console.log('Testing extension with Chromium at:', extensionPath);

  const context = await chromium.launchPersistentContext('', {
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const page = await context.newPage();
  console.log('Navigating to Web App http://localhost:5173...');
  await page.goto('http://localhost:5173/dashboard', {
    waitUntil: 'domcontentloaded',
    timeout: 10000,
  }).catch(() => console.log('Web app loaded or timeout'));

  await page.waitForTimeout(1000);
  console.log('Screenshot of Web App with Extension loaded...');
  await context.close();
}

testExtension().catch(console.error);
