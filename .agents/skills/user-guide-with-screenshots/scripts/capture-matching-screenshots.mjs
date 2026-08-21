import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/quiz-word-matching');

fs.mkdirSync(outDir, { recursive: true });

function startServer(port = 5178) {
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
  const port = 5178;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  page.on('console', (msg) => console.log('[PAGE CONSOLE]', msg.text()));
  page.on('pageerror', (err) => console.error('[PAGE ERROR]', err));

  const mockCards = [
    {
      id: 'c1',
      deckId: 'deck-ielts',
      word: 'ubiquitous',
      meaning: 'phổ biến, có mặt ở khắp mọi nơi',
      phonetic: '/juːˈbɪk.wɪ.təs/',
      exampleSentence: 'Smartphones have become ubiquitous in modern life.',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c2',
      deckId: 'deck-ielts',
      word: 'meticulous',
      meaning: 'tỉ mỉ, cẩn thận từng chi tiết nhỏ',
      phonetic: '/məˈtɪk.jə.ləs/',
      exampleSentence: 'He is meticulous about keeping his financial records.',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c3',
      deckId: 'deck-ielts',
      word: 'ephemeral',
      meaning: 'ngắn ngủi, phù du, thoáng qua',
      phonetic: '/ɪˈfem.ər.əl/',
      exampleSentence: 'Fame in the internet age can be quite ephemeral.',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c4',
      deckId: 'deck-ielts',
      word: 'versatile',
      meaning: 'linh hoạt, đa năng, nhiều công dụng',
      phonetic: '/ˈvɜː.sə.taɪl/',
      exampleSentence: 'A versatile tool that can be used for various tasks.',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c5',
      deckId: 'deck-ielts',
      word: 'tenacious',
      meaning: 'kiên trì, bền bỉ, không bỏ cuộc',
      phonetic: '/təˈneɪ.ʃəs/',
      exampleSentence: 'She is a tenacious advocate for human rights.',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockDeck = {
    id: 'deck-ielts',
    userId: 'user-1',
    title: 'IELTS Academic High-Frequency Words',
    description: '100 core academic vocabulary terms for IELTS Writing & Speaking band 7.5+.',
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
    cards: mockCards,
  };

  const mockMatchingQuiz = {
    deckId: 'deck-ielts',
    deckTitle: 'IELTS Academic High-Frequency Words',
    totalCards: 5,
    totalRounds: 1,
    rounds: [
      {
        roundIndex: 0,
        totalRounds: 1,
        wordTiles: [
          { id: 'w1', cardId: 'c1', text: 'ubiquitous', type: 'WORD', phonetic: '/juːˈbɪk.wɪ.təs/', audioUrl: null },
          { id: 'w2', cardId: 'c2', text: 'meticulous', type: 'WORD', phonetic: '/məˈtɪk.jə.ləs/', audioUrl: null },
          { id: 'w3', cardId: 'c3', text: 'ephemeral', type: 'WORD', phonetic: '/ɪˈfem.ər.əl/', audioUrl: null },
          { id: 'w4', cardId: 'c4', text: 'versatile', type: 'WORD', phonetic: '/ˈvɜː.sə.taɪl/', audioUrl: null },
          { id: 'w5', cardId: 'c5', text: 'tenacious', type: 'WORD', phonetic: '/təˈneɪ.ʃəs/', audioUrl: null },
        ],
        meaningTiles: [
          { id: 'm1', cardId: 'c1', text: 'phổ biến, có mặt ở khắp mọi nơi', type: 'MEANING', phonetic: null, audioUrl: null },
          { id: 'm3', cardId: 'c3', text: 'ngắn ngủi, phù du, thoáng qua', type: 'MEANING', phonetic: null, audioUrl: null },
          { id: 'm2', cardId: 'c2', text: 'tỉ mỉ, cẩn thận từng chi tiết nhỏ', type: 'MEANING', phonetic: null, audioUrl: null },
          { id: 'm5', cardId: 'c5', text: 'kiên trì, bền bỉ, không bỏ cuộc', type: 'MEANING', phonetic: null, audioUrl: null },
          { id: 'm4', cardId: 'c4', text: 'linh hoạt, đa năng, nhiều công dụng', type: 'MEANING', phonetic: null, audioUrl: null },
        ],
      },
    ],
  };

  const mockMatchingResult = {
    totalPairs: 5,
    matchedCount: 5,
    accuracyPercentage: 100,
    maxCombo: 5,
    totalTimeMs: 12400,
    totalXpEarned: 35,
    xpBreakdown: {
      baseXp: 10,
      comboBonusXp: 10,
      speedBonusXp: 10,
      perfectBonusXp: 5,
      totalXp: 35,
    },
    missedCards: [],
  };

  // Set mock auth token in context
  await context.addInitScript(() => {
    localStorage.setItem('wordstreak_token', 'mock-jwt-token');
    localStorage.setItem('wordstreak_user', JSON.stringify({
      id: 'user-1',
      email: 'alex@wordstreak.com',
      username: 'Alex',
    }));
  });

  // Universal mock network interceptor
  await page.route('**/*', async (route) => {
    const resourceType = route.request().resourceType();
    if (resourceType === 'document' || resourceType === 'script' || resourceType === 'stylesheet' || resourceType === 'image') {
      return route.continue();
    }

    const url = route.request().url();
    if (url.includes('/auth/refresh') || url.includes('/auth/login')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-jwt-token' }),
      });
    }
    if (url.includes('/auth/me') || url.includes('/users/me')) {
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
    if (url.includes('/gamification/xp/summary')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            userId: 'user-1',
            totalXp: 1250,
            level: 5,
            currentLevelXp: 250,
            nextLevelRequiredXp: 500,
            progressPercent: 50,
            tier: 'BRONZE',
            todayXp: 45,
          },
        }),
      });
    }
    if (url.includes('/streaks') || url.includes('/streak')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            currentStreak: 12,
            bestStreak: 15,
            flameTier: 3,
            isActiveToday: true,
            streakIncreased: false,
            message: 'Keep going!',
          },
        }),
      });
    }
    if (url.includes('/decks/deck-ielts/cards')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockCards,
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
    if (url.includes('/practice/matching/submit')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockMatchingResult,
        }),
      });
    }
    if (url.includes('/practice/matching')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockMatchingQuiz,
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: {} }),
    });
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
      document.querySelectorAll('.__guide_badge').forEach((b) => b.remove());
      document.querySelectorAll('*').forEach((el) => {
        if (el.style.outline && el.style.outline.includes('rgb(239, 68, 68)')) {
          el.style.outline = '';
          el.style.boxShadow = '';
        }
      });
    });
  };

  console.log('1. Capturing Step 1: Deck Details with Practice Launcher...');
  await page.goto(`${baseUrl}/decks/deck-ielts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const quizButton = page.locator('button:has-text("Trắc nghiệm Quiz")');
  await quizButton.waitFor({ state: 'visible', timeout: 8000 });
  await addAnnotation(quizButton, '①');
  await page.screenshot({ path: path.join(outDir, 'step-01-deck-practice-launcher.png') });
  await clearAnnotations();

  console.log('2. Capturing Step 2: Practice Setup Modal with Nối từ Tab...');
  await quizButton.click();
  await page.waitForSelector('text=Practice Quiz');
  const matchingTab = page.locator('button:has-text("Nối từ")');
  await matchingTab.click();
  await page.waitForTimeout(400);
  await addAnnotation(matchingTab, '①');
  const startBtn = page.locator('button:has-text("Start Practice Quiz")');
  await addAnnotation(startBtn, '②');
  await page.screenshot({ path: path.join(outDir, 'step-02-setup-modal-tab.png') });
  await clearAnnotations();

  console.log('3. Capturing Step 3: Word Matching Game Board Selection...');
  await page.goto(`${baseUrl}/decks/deck-ielts/practice/matching?limit=5&zen=false`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Từ vựng (Vocabulary)');
  await page.waitForTimeout(600);

  // Find tile by role=button containing ubiquitous
  const wordTile = page.locator('div[role="button"]').filter({ hasText: 'ubiquitous' });
  await wordTile.waitFor({ state: 'visible', timeout: 8000 });
  await wordTile.click();
  await page.waitForTimeout(400);

  const meaningTile = page.locator('div[role="button"]').filter({ hasText: 'phổ biến, có mặt ở khắp mọi nơi' });
  await meaningTile.waitFor({ state: 'visible', timeout: 8000 });

  await addAnnotation(wordTile, '①');
  await addAnnotation(meaningTile, '②');
  await page.screenshot({ path: path.join(outDir, 'step-03-gameboard-selection.png') });
  await clearAnnotations();

  console.log('4. Capturing Step 4: Combo & Progress Feedback with Audio Toggle...');
  // Click the meaning tile to complete the 1st match
  await meaningTile.click();
  await page.waitForTimeout(500);

  // Match 2nd pair (meticulous) to trigger 2x combo flame
  const word2 = page.locator('div[role="button"]').filter({ hasText: 'meticulous' });
  const meaning2 = page.locator('div[role="button"]').filter({ hasText: 'tỉ mỉ, cẩn thận từng chi tiết nhỏ' });
  await word2.click();
  await page.waitForTimeout(250);
  await meaning2.click();
  await page.waitForTimeout(600);

  // Exact combo flame badge selector
  const comboBadge = page.locator('div.rounded-full:has-text("Combo")').first();
  await comboBadge.waitFor({ state: 'visible', timeout: 5000 });
  const muteBtn = page.locator('button[aria-label*="âm thanh"]').first();

  await addAnnotation(comboBadge, '①');
  await addAnnotation(muteBtn, '②');
  await page.screenshot({ path: path.join(outDir, 'step-04-combo-progress-feedback.png') });
  await clearAnnotations();

  console.log('5. Capturing Step 5: Quiz Results View with XP Breakdown...');
  // Match remaining pairs to finish the round (ephemeral, versatile, tenacious)
  // Ephemeral:
  const word3 = page.locator('div[role="button"]').filter({ hasText: 'ephemeral' });
  const meaning3 = page.locator('div[role="button"]').filter({ hasText: 'ngắn ngủi, phù du, thoáng qua' });
  await word3.click();
  await page.waitForTimeout(200);
  await meaning3.click();
  await page.waitForTimeout(400);

  // Versatile:
  const word4 = page.locator('div[role="button"]').filter({ hasText: 'versatile' });
  const meaning4 = page.locator('div[role="button"]').filter({ hasText: 'linh hoạt, đa năng, nhiều công dụng' });
  await word4.click();
  await page.waitForTimeout(200);
  await meaning4.click();
  await page.waitForTimeout(400);

  // Tenacious:
  const word5 = page.locator('div[role="button"]').filter({ hasText: 'tenacious' });
  const meaning5 = page.locator('div[role="button"]').filter({ hasText: 'kiên trì, bền bỉ, không bỏ cuộc' });
  await word5.click();
  await page.waitForTimeout(200);
  await meaning5.click();

  // Wait for submission and Results view
  await page.waitForSelector('text=Flawless Victory!', { timeout: 10000 });
  await page.waitForTimeout(600);

  const xpBreakdownBox = page.locator('div.rounded-2xl:has-text("Chi tiết điểm thưởng")').first();
  const accuracyCard = page.locator('span:has-text("Accuracy")').locator('..');
  const retakeBtn = page.locator('button:has-text("Retake Quiz")');

  await addAnnotation(xpBreakdownBox, '①');
  await addAnnotation(accuracyCard, '②');
  await addAnnotation(retakeBtn, '③');
  await page.screenshot({ path: path.join(outDir, 'step-05-quiz-results-summary.png') });

  console.log('All 5 real annotated matching screenshots captured successfully!');
  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
