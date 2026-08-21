import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/speech-pronunciation-assessment');

fs.mkdirSync(outDir, { recursive: true });

function startServer(port = 5182) {
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
  const port = 5182;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ['microphone'],
  });

  const page = await context.newPage();
  page.on('console', (msg) => console.log('[PAGE CONSOLE]', msg.text()));
  page.on('pageerror', (err) => console.error('[PAGE ERROR]', err));

  const mockCards = [
    {
      id: 'c1',
      deckId: 'deck-ielts',
      word: 'meticulous',
      meaning: 'tỉ mỉ, cẩn thận từng chi tiết nhỏ',
      phonetic: '/məˈtɪk.jə.ləs/',
      exampleSentence: 'He is meticulous about keeping his financial records.',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: {
        status: 'LEARNING',
      },
    },
    {
      id: 'c2',
      deckId: 'deck-ielts',
      word: 'ubiquitous',
      meaning: 'phổ biến, có mặt ở khắp mọi nơi',
      phonetic: '/juːˈbɪk.wɪ.təs/',
      exampleSentence: 'Smartphones have become ubiquitous in modern life.',
      audioUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: {
        status: 'MASTERED',
      },
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
      progress: {
        status: 'NEW',
      },
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

  // Set mock auth token in context
  await context.addInitScript(() => {
    localStorage.setItem('wordstreak_token', 'mock-jwt-token');
    localStorage.setItem('wordstreak_view_mode', 'table');
    localStorage.setItem(
      'wordstreak_user',
      JSON.stringify({
        id: 'user-1',
        email: 'alex@wordstreak.com',
        username: 'Alex',
      })
    );

    // Mock Web Speech API SpeechRecognition
    class MockSpeechRecognition extends EventTarget {
      constructor() {
        super();
        this.continuous = false;
        this.interimResults = true;
        this.lang = 'en-US';
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
      }
      start() {
        console.log('[MockSpeechRecognition] start called');
      }
      stop() {
        console.log('[MockSpeechRecognition] stop called');
        if (this.onend) this.onend();
      }
      abort() {
        console.log('[MockSpeechRecognition] abort called');
      }
    }

    window.SpeechRecognition = MockSpeechRecognition;
    window.webkitSpeechRecognition = MockSpeechRecognition;
  });

  // Universal mock network interceptor
  await page.route('**/*', async (route) => {
    const resourceType = route.request().resourceType();
    const url = route.request().url();

    if (
      resourceType === 'document' ||
      resourceType === 'script' ||
      resourceType === 'stylesheet' ||
      resourceType === 'image' ||
      resourceType === 'font' ||
      url.includes('fonts.gstatic.com') ||
      url.includes('fonts.googleapis.com')
    ) {
      return route.continue();
    }

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
    if (url.includes('/cards')) {
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
    if (url.includes('/practice/voice/submit') || url.includes('/practice/pronunciation/submit')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            cardId: 'c1',
            spokenText: 'meticulous',
            accuracyScore: 100,
            tier: 'EXACT',
            xpAwarded: 15,
            isDailyCapped: false,
            diffSpans: [
              { char: 'm', type: 'MATCH' },
              { char: 'e', type: 'MATCH' },
              { char: 't', type: 'MATCH' },
              { char: 'i', type: 'MATCH' },
              { char: 'c', type: 'MATCH' },
              { char: 'u', type: 'MATCH' },
              { char: 'l', type: 'MATCH' },
              { char: 'o', type: 'MATCH' },
              { char: 'u', type: 'MATCH' },
              { char: 's', type: 'MATCH' },
            ],
          },
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

  console.log('1. Capturing Step 1: Launch Points on Deck Detail Page...');
  await page.goto(`${baseUrl}/decks/deck-ielts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const voicePracticeBtn = page.locator('button[data-testid^="voice-practice"]').first();
  await voicePracticeBtn.waitFor({ state: 'visible', timeout: 8000 });
  const quizButton = page.locator('button:has-text("Trắc nghiệm Quiz")');

  await addAnnotation(voicePracticeBtn, '①');
  await addAnnotation(quizButton, '②');
  await page.screenshot({ path: path.join(outDir, 'step-01-launch-points.png') });
  await clearAnnotations();

  console.log('2. Capturing Step 2: Voice Studio Initial Modal...');
  await voicePracticeBtn.click();
  await page.waitForSelector('[data-testid="pronunciation-modal-content"]');
  await page.waitForTimeout(400);

  const syllableChips = page.locator('[data-testid="phonetic-word-breakdown"]');
  const accentSelector = page.locator('[data-testid="accent-audio-selector"]');
  const recordButton = page.locator('[data-testid="start-recording-button"]');

  await addAnnotation(syllableChips, '①');
  await addAnnotation(accentSelector, '②');
  await addAnnotation(recordButton, '③');
  await page.screenshot({ path: path.join(outDir, 'step-02-voice-studio-modal.png') });
  await clearAnnotations();

  console.log('3. Capturing Step 3: Live Recording & Soundwave...');
  // Simulate the LISTENING state in the modal DOM for high-fidelity screenshot
  await page.evaluate(() => {
    const centralStage = document.querySelector('[data-testid="pronunciation-modal-content"] .bg-neutral-50');
    if (centralStage) {
      centralStage.innerHTML = `
        <div class="flex flex-col items-center space-y-3 py-1" data-testid="listening-stage-mock">
          <div class="flex items-center justify-center gap-1.5 h-12 py-2" data-testid="soundwave-mock">
            <span class="w-1.5 rounded-full bg-purple-600 animate-pulse" style="height: 24px;"></span>
            <span class="w-1.5 rounded-full bg-purple-600 animate-pulse" style="height: 38px;"></span>
            <span class="w-1.5 rounded-full bg-purple-600 animate-pulse" style="height: 48px;"></span>
            <span class="w-1.5 rounded-full bg-purple-600 animate-pulse" style="height: 34px;"></span>
            <span class="w-1.5 rounded-full bg-purple-600 animate-pulse" style="height: 20px;"></span>
          </div>
          <button type="button" class="px-6 py-2 rounded-full bg-red-600 text-white font-medium text-sm shadow-xs cursor-pointer" data-testid="stop-mock-btn">
            Stop Speaking
          </button>
          <p class="text-xs font-mono text-purple-700 italic animate-pulse" data-testid="transcript-mock">
            "meticulous"
          </p>
        </div>
      `;
    }
  });
  await page.waitForTimeout(300);

  const soundwaveEl = page.locator('[data-testid="soundwave-mock"]');
  const stopBtn = page.locator('[data-testid="stop-mock-btn"]');
  const transcriptEl = page.locator('[data-testid="transcript-mock"]');

  await addAnnotation(soundwaveEl, '①');
  await addAnnotation(stopBtn, '②');
  await addAnnotation(transcriptEl, '③');
  await page.screenshot({ path: path.join(outDir, 'step-03-recording-soundwave.png') });
  await clearAnnotations();

  console.log('4. Capturing Step 4: Exact Match Feedback Tier (100% Emerald)...');
  await page.evaluate(() => {
    const centralStage = document.querySelector('[data-testid="pronunciation-modal-content"] .bg-neutral-50');
    if (centralStage) {
      centralStage.innerHTML = `
        <div class="flex flex-col items-center space-y-4 w-full py-1">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200" data-testid="emerald-badge-mock">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="font-bold text-base">100%</span>
            <span class="text-xs font-semibold uppercase tracking-wider font-mono">Exact Match</span>
            <span class="ml-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-600 text-white shadow-xs">+15 XP</span>
          </div>
          <div class="flex items-center gap-3" data-testid="actions-mock">
            <button type="button" class="px-5 py-2 rounded-full border border-neutral-300 bg-white text-black font-semibold text-xs hover:border-black cursor-pointer">
              Try Again
            </button>
            <button type="button" class="px-6 py-2 rounded-full bg-black text-white font-semibold text-xs hover:bg-neutral-800 cursor-pointer shadow-xs">
              Done
            </button>
          </div>
        </div>
      `;
    }
  });
  await page.waitForTimeout(300);

  const emeraldBadge = page.locator('[data-testid="emerald-badge-mock"]');
  const actionButtons = page.locator('[data-testid="actions-mock"]');

  await addAnnotation(emeraldBadge, '①');
  await addAnnotation(actionButtons, '②');
  await page.screenshot({ path: path.join(outDir, 'step-04-feedback-exact-tier.png') });
  await clearAnnotations();

  console.log('5. Capturing Step 5: Close Match Feedback Tier (85% Violet) & Diff Breakdown...');
  await page.evaluate(() => {
    // Add diff breakdown to PhoneticWordBreakdown container
    const breakdown = document.querySelector('[data-testid="phonetic-word-breakdown"]');
    if (breakdown) {
      const diffContainer = document.createElement('div');
      diffContainer.className = 'flex items-center justify-center flex-wrap gap-1 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-mono tracking-wide mt-2';
      diffContainer.setAttribute('data-testid', 'mock-diff-container');
      diffContainer.innerHTML = `
        <span class="text-emerald-700 font-bold">m</span>
        <span class="text-emerald-700 font-bold">e</span>
        <span class="text-emerald-700 font-bold">t</span>
        <span class="text-emerald-700 font-bold">i</span>
        <span class="text-emerald-700 font-bold">c</span>
        <span class="text-red-500 line-through bg-red-100 px-1 rounded font-bold" title="Missing: u">u</span>
        <span class="text-emerald-700 font-bold">l</span>
        <span class="text-emerald-700 font-bold">o</span>
        <span class="text-emerald-700 font-bold">u</span>
        <span class="text-emerald-700 font-bold">s</span>
      `;
      breakdown.appendChild(diffContainer);
    }

    const centralStage = document.querySelector('[data-testid="pronunciation-modal-content"] .bg-neutral-50');
    if (centralStage) {
      centralStage.innerHTML = `
        <div class="flex flex-col items-center space-y-4 w-full py-1">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium bg-purple-50 text-purple-700 border-purple-200" data-testid="violet-badge-mock">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span class="font-bold text-base">85%</span>
            <span class="text-xs font-semibold uppercase tracking-wider font-mono">Close Match</span>
            <span class="ml-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-600 text-white shadow-xs">+10 XP</span>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" class="px-5 py-2 rounded-full border border-neutral-300 bg-white text-black font-semibold text-xs hover:border-black cursor-pointer">
              Try Again
            </button>
            <button type="button" class="px-6 py-2 rounded-full bg-black text-white font-semibold text-xs hover:bg-neutral-800 cursor-pointer shadow-xs">
              Done
            </button>
          </div>
        </div>
      `;
    }
  });
  await page.waitForTimeout(300);

  const violetBadge = page.locator('[data-testid="violet-badge-mock"]');
  const diffBox = page.locator('[data-testid="mock-diff-container"]');
  const chipContainer = page.locator('[data-testid="phonetic-word-breakdown"] > div').first();

  await addAnnotation(violetBadge, '①');
  await addAnnotation(chipContainer, '②');
  await addAnnotation(diffBox, '③');
  await page.screenshot({ path: path.join(outDir, 'step-05-feedback-close-tier-diff.png') });
  await clearAnnotations();

  console.log('6. Capturing Step 6: Troubleshooting & Mic Permission Denied Banner...');
  await page.evaluate(() => {
    const diff = document.querySelector('[data-testid="mock-diff-container"]');
    if (diff) diff.remove();

    const centralStage = document.querySelector('[data-testid="pronunciation-modal-content"] .bg-neutral-50');
    if (centralStage) {
      centralStage.innerHTML = `
        <div class="p-4 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 text-sm w-full" data-testid="mic-banner-mock">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-neutral-900 font-semibold">
              <span class="text-lg">🔒</span>
              <h4>Microphone Access Required</h4>
            </div>
            <p class="text-xs text-neutral-600 leading-relaxed">
              To assess pronunciation, WordStreak needs microphone permission. Click the lock icon in your browser address bar to allow microphone access, then click Retry below.
            </p>
            <button type="button" class="self-start px-4 py-1.5 text-xs font-semibold rounded-full bg-black text-white hover:bg-neutral-800 active:scale-95 cursor-pointer" data-testid="mic-retry-btn">
              Retry Microphone Permission
            </button>
          </div>
        </div>
      `;
    }
  });
  await page.waitForTimeout(300);

  const micBanner = page.locator('[data-testid="mic-banner-mock"]');
  const retryBtn = page.locator('[data-testid="mic-retry-btn"]');

  await addAnnotation(micBanner, '①');
  await addAnnotation(retryBtn, '②');
  await page.screenshot({ path: path.join(outDir, 'step-06-troubleshooting-permission.png') });
  await clearAnnotations();

  console.log('All screenshots captured successfully!');
  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
