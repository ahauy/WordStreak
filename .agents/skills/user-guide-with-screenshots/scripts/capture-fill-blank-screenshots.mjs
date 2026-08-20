import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/quiz-fill-in-the-blank');

fs.mkdirSync(outDir, { recursive: true });

function startServer(port = 5176) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }

      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.json': 'application/json',
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading file');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    server.listen(port, () => {
      console.log(`SPA Server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function main() {
  const port = 5176;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('[PAGE CONSOLE]', msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err));

  const mockDeck = {
    id: 'deck-ielts',
    userId: 'user-1',
    title: 'IELTS Academic Vocabulary',
    description: 'Core 100 high-frequency academic words for IELTS Writing and Speaking band 7.5+.',
    color: 'PURPLE',
    icon: 'Sparkles',
    isPublic: true,
    isArchived: false,
    tags: ['IELTS', 'Band7+', 'Academic'],
    stats: {
      totalCards: 20,
      newCards: 5,
      learningCards: 10,
      masteredCards: 5,
      dueCards: 8,
    },
    cards: [
      {
        id: 'c1',
        deckId: 'deck-ielts',
        word: 'discovery',
        meaning: 'sự khám phá, phát hiện',
        phonetic: '/dɪˈskʌv.ər.i/',
        exampleSentence: 'The scientist made an important discovery in genetics.',
        audioUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  const mockQuestions = [
    {
      id: 'fb-1',
      cardId: 'c1',
      sentenceWithBlank: 'The scientist made an important [ _____ ] in genetics.',
      sentencePrefix: 'The scientist made an important ',
      sentenceSuffix: ' in genetics.',
      targetWord: 'discovery',
      targetInflection: 'discovery',
      meaning: 'sự khám phá, phát hiện',
      phonetic: '/dɪˈskʌv.ər.i/',
      audioUrl: null,
      scrambledLetters: ['y', 'r', 'e', 'v', 'o', 'c', 's', 'i', 'd'],
      wordLength: 9,
    },
  ];

  // Universal mock network interceptor
  await page.route('**/*', async (route) => {
    const resourceType = route.request().resourceType();
    if (resourceType === 'document' || resourceType === 'script' || resourceType === 'stylesheet' || resourceType === 'image') {
      return route.continue();
    }

    const url = route.request().url();
    if (url.includes('/auth/refresh')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-jwt-token',
        }),
      });
    }
    if (url.includes('/auth/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'user-1',
            email: 'alex@wordstreak.com',
            username: 'Alex',
            dailyGoal: 10,
            avatarUrl: null,
            createdAt: '2026-08-01',
            updatedAt: '2026-08-01',
          },
        }),
      });
    }
    if (url.includes('/decks/deck-ielts/cards')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockDeck.cards,
          meta: { total: 20, page: 1, limit: 10, totalPages: 2, hasNextPage: true, hasPrevPage: false },
        }),
      });
    }
    if (url.includes('/decks/deck-ielts')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeck),
      });
    }
    if (url.includes('/practice/fill-in-the-blank')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockQuestions,
        }),
      });
    }
    if (url.includes('/practice/submit-quiz')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalQuestions: 1,
            correctCount: 1,
            accuracyPercentage: 100,
            totalXpEarned: 25,
            maxCombo: 1,
            missedCards: [],
          },
        }),
      });
    }
    return route.continue();
  });

  const addAnnotation = async (locator, badgeNumber) => {
    await locator.first().evaluate((el, num) => {
      el.style.position = 'relative';
      el.style.outline = '3.5px solid #EF4444';
      el.style.boxShadow = '0 0 0 7px rgba(239, 68, 68, 0.3)';
      el.style.borderRadius = el.style.borderRadius || '12px';

      const badge = document.createElement('div');
      badge.className = '__guide_badge';
      badge.textContent = num;
      badge.style.position = 'absolute';
      badge.style.top = '-14px';
      badge.style.left = '-14px';
      badge.style.width = '28px';
      badge.style.height = '28px';
      badge.style.backgroundColor = '#EF4444';
      badge.style.color = '#ffffff';
      badge.style.borderRadius = '50%';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.fontWeight = 'bold';
      badge.style.fontSize = '14px';
      badge.style.zIndex = '9999';
      badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
      el.appendChild(badge);
    }, badgeNumber);
  };

  const clearAnnotations = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('.__guide_badge').forEach(b => b.remove());
      document.querySelectorAll('*').forEach(el => {
        if (el.style.outline && el.style.outline.includes('rgb(239, 68, 68)')) {
          el.style.outline = '';
          el.style.boxShadow = '';
        }
      });
    });
  };

  console.log('1. Capturing Step 1: Deck Detail Page with Practice Button...');
  await page.goto(`${baseUrl}/decks/deck-ielts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const quizButton = page.locator('button:has-text("Trắc nghiệm Quiz")');
  await quizButton.waitFor({ state: 'visible', timeout: 8000 });
  await addAnnotation(quizButton, '①');
  await page.screenshot({ path: path.join(outDir, 'step-01-practice-button.png') });
  await clearAnnotations();

  console.log('2. Capturing Step 2: Practice Setup Modal with Mode Selector...');
  await quizButton.click();
  await page.waitForSelector('text=Practice Quiz');
  const fillBlankTab = page.locator('button:has-text("Điền từ vào câu")');
  await fillBlankTab.click();
  await page.waitForTimeout(400);
  await addAnnotation(fillBlankTab, '①');
  await addAnnotation(page.locator('button:has-text("10 Cards")'), '②');
  await addAnnotation(page.locator('button:has-text("Start Practice Quiz")'), '③');
  await page.screenshot({ path: path.join(outDir, 'step-02-setup-modal.png') });
  await clearAnnotations();

  console.log('3. Capturing Step 3: Fill-in-the-blank Quiz Page (Direct Typing)...');
  await page.goto(`${baseUrl}/decks/deck-ielts/practice/fill-blank?limit=10&zen=false`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Target Meaning');
  await page.waitForTimeout(500);
  await addAnnotation(page.locator('h3:has-text("sự khám phá")'), '①');
  await addAnnotation(page.locator('input[placeholder*="Type word"]'), '②');
  await addAnnotation(page.locator('button:has-text("Hint")'), '③');
  await addAnnotation(page.locator('button:has-text("Switch to Letter Tiles")'), '④');
  await page.screenshot({ path: path.join(outDir, 'step-03-fill-blank-typing.png') });
  await clearAnnotations();

  console.log('4. Capturing Step 4: Anagram Mode with Scrambled Tiles...');
  await page.click('button:has-text("Switch to Letter Tiles")');
  await page.waitForTimeout(400);
  await addAnnotation(page.locator('button[aria-label="Select letter y"]'), '①');
  await addAnnotation(page.locator('button:has-text("Backspace")'), '②');
  await addAnnotation(page.locator('button:has-text("Switch to Direct Typing")'), '③');
  await page.screenshot({ path: path.join(outDir, 'step-04-anagram-mode.png') });
  await clearAnnotations();

  console.log('5. Capturing Step 5: Correct Feedback State...');
  await page.click('button:has-text("Switch to Direct Typing")');
  await page.fill('input[placeholder*="Type word"]', 'discovery');
  await page.click('button:has-text("Submit")');
  await page.waitForTimeout(300);
  await addAnnotation(page.locator('input[value="discovery"]'), '①');
  await page.screenshot({ path: path.join(outDir, 'step-05-feedback-correct.png') });
  await clearAnnotations();

  console.log('6. Capturing Step 6: Results Summary View...');
  await page.waitForTimeout(1600);
  await page.waitForSelector('text=Accuracy');
  await page.waitForTimeout(400);
  await addAnnotation(page.locator('span:has-text("Accuracy")').locator('..'), '①');
  await addAnnotation(page.locator('span:has-text("XP Earned")').locator('..'), '②');
  await addAnnotation(page.locator('button:has-text("Retake Quiz")'), '③');
  await page.screenshot({ path: path.join(outDir, 'step-06-results-summary.png') });

  console.log('All 6 real annotated screenshots captured successfully!');
  await browser.close();
  server.close();
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
