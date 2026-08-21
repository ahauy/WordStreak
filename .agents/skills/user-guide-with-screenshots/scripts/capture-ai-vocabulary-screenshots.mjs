import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/ai-vocabulary-generator');

fs.mkdirSync(outDir, { recursive: true });

function startServer(port = 5188) {
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
  const port = 5188;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 820 },
  });

  const page = await context.newPage();

  const mockCards = [
    {
      id: 'card-1',
      deckId: 'deck-123',
      word: 'serendipity',
      meaning: 'sự tình cờ may mắn, duyên may',
      phonetic: '/ˌser.ənˈdɪp.ə.ti/',
      exampleSentence: 'Finding this book was a pure serendipity.',
      collocations: 'pure serendipity, happy serendipity',
      mnemonic: 'Serendip (vua Ba Tư may mắn) + ity -> luôn gặp may mắn bất ngờ',
      audioUrl: null,
      imageUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: {
        status: 'LEARNING',
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString(),
      },
    },
  ];

  const mockDeck = {
    id: 'deck-123',
    userId: 'user-1',
    title: 'IELTS Band 8.0 Core Vocabulary',
    description: 'Essential high-yield vocabulary for IELTS reading, speaking and writing.',
    color: '#8B5CF6',
    icon: 'Sparkles',
    coverImageUrl: null,
    tags: ['IELTS', 'Academic', 'Band 8.0'],
    isPublic: true,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      totalCards: 24,
      newCards: 6,
      learningCards: 12,
      masteredCards: 6,
      dueCards: 5,
    },
    cards: mockCards,
  };

  const mockAiGenerated = {
    card: {
      word: 'serendipity',
      partOfSpeech: 'noun',
      phonetic: '/ˌser.ənˈdɪp.ə.ti/',
      meaningVi: 'sự tình cờ may mắn; duyên may bất ngờ (tìm thấy điều tuyệt vời một cách ngẫu nhiên)',
      meaningEn: 'the occurrence and development of events by chance in a happy or beneficial way',
      exampleSentence: 'The discovery of penicillin was a fortunate act of serendipity.',
      exampleTranslation: 'Việc phát hiện ra penicillin là một sự tình cờ may mắn tuyệt vời.',
      collocations: ['pure serendipity', 'happy serendipity', 'an act of serendipity', 'serendipitous discovery'],
      mnemonic: 'Serendip (vương quốc may mắn) + ity -> luôn tình cờ bắt gặp điều kỳ diệu!',
      audioUrl: null,
    },
    isCached: false,
    source: 'GEMINI_FLASH',
    dailyQuotaRemaining: 29,
    dailyQuotaMax: 30,
  };

  await page.route('**/api/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/auth/refresh')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-jwt-token' }),
      });
    }

    if (url.includes('/auth/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'user-1',
            username: 'AlexNguyen',
            email: 'alex.nguyen@example.com',
            dailyGoal: 10,
            avatarUrl: null,
            createdAt: '2026-08-01',
            updatedAt: '2026-08-01',
          },
        }),
      });
    }

    if (url.includes('/decks/deck-123/cards')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockCards,
          meta: {
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
      });
    }

    if (url.includes('/decks/deck-123')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDeck),
      });
    }

    if (url.includes('/decks')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockDeck]),
      });
    }

    if (url.includes('/ai/generate-card')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAiGenerated),
      });
    }

    if (url.includes('/streaks/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            currentStreak: 7,
            bestStreak: 14,
            isActiveToday: true,
            flameTier: 2,
            streakFreezes: 1,
            maxStreakFreezes: 2,
          },
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
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
      badge.style.width = '30px';
      badge.style.height = '30px';
      badge.style.borderRadius = '50%';
      badge.style.backgroundColor = '#EF4444';
      badge.style.color = '#ffffff';
      badge.style.fontSize = '15px';
      badge.style.fontWeight = 'bold';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.boxShadow = '0 3px 6px rgba(0,0,0,0.35)';
      badge.style.zIndex = '99999';
      badge.style.border = '2.5px solid #ffffff';
      el.appendChild(badge);
    }, badgeNumber);
  };

  const clearAnnotations = async () => {
    await page.evaluate(() => {
      document.querySelectorAll('.__guide_badge').forEach(el => el.remove());
      document.querySelectorAll('*').forEach(el => {
        if (el.style.outline && el.style.outline.includes('#EF4444')) {
          el.style.outline = '';
          el.style.boxShadow = '';
        }
      });
    });
  };

  // ==========================================
  // SCREENSHOT 1: Open Add Card in Deck Detail
  // ==========================================
  console.log('Capturing Step 01: Deck Detail and Add Card Button...');
  await page.goto(`${baseUrl}/decks/deck-123`);
  await page.waitForSelector('button:has-text("Thêm thẻ mới")', { timeout: 10000 });
  await page.waitForTimeout(500);

  const addCardBtn = page.locator('button:has-text("Thêm thẻ mới")').first();
  const deckHeader = page.locator('h1:has-text("IELTS Band 8.0 Core Vocabulary")').first();

  await addAnnotation(addCardBtn, '①');
  await addAnnotation(deckHeader, '②');
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outDir, 'step-01-open-add-card.png'),
    fullPage: false,
  });
  await clearAnnotations();

  // ==========================================
  // SCREENSHOT 2: Add Card Modal with Word & Sparkle Button
  // ==========================================
  console.log('Capturing Step 02: Sparkle AI Button in AddCardModal...');
  await addCardBtn.click();
  await page.waitForSelector('#card-word-input', { timeout: 5000 });
  await page.waitForTimeout(400);

  const wordInput = page.locator('#card-word-input');
  await wordInput.fill('serendipity');
  await page.waitForTimeout(300);

  const sparkleBtn = page.locator('button:has-text("Tự động điền AI")').first();
  const livePreview = page.locator('div:has-text("Xem trước thực tế")').first();

  await addAnnotation(wordInput, '①');
  await addAnnotation(sparkleBtn, '②');
  await addAnnotation(livePreview, '③');
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outDir, 'step-02-ai-autofill-button.png'),
    fullPage: false,
  });
  await clearAnnotations();

  // ==========================================
  // SCREENSHOT 3: AI Auto-Filled Full Rich Card
  // ==========================================
  console.log('Capturing Step 03: AI Auto-Filled Card Result & Live Preview...');
  await sparkleBtn.click();
  await page.waitForTimeout(600);

  const meaningInput = page.locator('#card-meaning-input');
  const advancedContext = page.locator('div:has-text("Ngữ cảnh mở rộng & Mẹo ghi nhớ")').first();
  const livePreviewUpdated = page.locator('div:has-text("Xem trước thực tế")').first();
  const saveCardBtn = page.locator('button:has-text("Lưu thẻ")').first();

  await addAnnotation(meaningInput, '①');
  await addAnnotation(advancedContext, '②');
  await addAnnotation(livePreviewUpdated, '③');
  await addAnnotation(saveCardBtn, '④');
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outDir, 'step-03-ai-autofilled-result.png'),
    fullPage: false,
  });
  await clearAnnotations();

  // Close Add Modal
  const closeBtn = page.locator('button[aria-label="Đóng cửa sổ"]').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // ==========================================
  // SCREENSHOT 4: Edit Card with AI Sparkle
  // ==========================================
  console.log('Capturing Step 04: Edit Card Modal with AI Sparkle...');
  const editCardBtn = page.locator('button[title="Chỉnh sửa thẻ"]').first();
  if (await editCardBtn.isVisible()) {
    await editCardBtn.click();
    await page.waitForTimeout(600);

    const editWordInput = page.locator('#edit-card-word');
    const editSparkleBtn = page.locator('button:has-text("Tự động điền AI")').first();
    const updateBtn = page.locator('button:has-text("Lưu thay đổi")').first();

    await addAnnotation(editWordInput, '①');
    await addAnnotation(editSparkleBtn, '②');
    await addAnnotation(updateBtn, '③');
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(outDir, 'step-04-edit-card-ai.png'),
      fullPage: false,
    });
    await clearAnnotations();
  }

  await browser.close();
  server.close();
  console.log('All real screenshots captured successfully in docs/user-guides/images/ai-vocabulary-generator/!');
}

main().catch(err => {
  console.error('Capture Error:', err);
  process.exit(1);
});
