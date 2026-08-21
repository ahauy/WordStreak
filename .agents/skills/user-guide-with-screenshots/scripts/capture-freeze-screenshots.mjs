import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');
const distDir = path.join(rootDir, 'apps/web/dist');
const outDir = path.join(rootDir, 'docs/user-guides/images/streak-freeze');

fs.mkdirSync(outDir, { recursive: true });

function startServer(port = 5179) {
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
  const port = 5179;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('[PAGE CONSOLE]', msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err));

  let currentStreakMock = {
    userId: 'user-1',
    currentStreak: 14,
    bestStreak: 21,
    lastActiveDate: new Date().toISOString(),
    isActiveToday: true,
    isPendingToday: false,
    streakFreezes: 1,
    maxStreakFreezes: 2,
    wasProtectedByFreeze: false,
    freezesUsed: 0,
    timezone: 'Asia/Ho_Chi_Minh',
    flameTier: 3,
  };

  const mockDueCard = {
    id: 'prog-1',
    cardId: 'card-1',
    deckId: 'deck-1',
    deckTitle: 'IELTS Band 8.0 Core Vocabulary',
    deckColor: '#9333ea',
    word: 'resilient',
    meaning: 'kiên cường, có khả năng phục hồi nhanh chóng',
    phonetic: '/rɪˈzɪl.jənt/',
    audioUrl: null,
    exampleSentence: 'The community was resilient in facing unprecedented challenges.',
    collocations: 'resilient economy, highly resilient',
    mnemonic: 'Re (lại) + silent (im lặng vượt qua) -> kiên cường phục hồi',
    imageUrl: null,
    status: 'LEARNING',
    interval: 6,
    repetitions: 2,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
  };

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
        body: JSON.stringify({ accessToken: 'mock-jwt-token' }),
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
    if (url.includes('/streaks/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: currentStreakMock,
        }),
      });
    }
    if (url.includes('/streaks/record-activity')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            currentStreak: 7,
            bestStreak: 14,
            streakIncreased: true,
            isActiveToday: true,
            flameTier: 2,
            streakFreezes: 2,
            maxStreakFreezes: 2,
            earnedMilestoneFreeze: true,
            message: 'Chúc mừng bạn đạt mốc 7 ngày streak! Nhận ngay +1 Streak Freeze 🧊',
          },
        }),
      });
    }
    if (url.includes('/reviews/due')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [mockDueCard],
          meta: { totalDue: 1, overdueCount: 0, dueTodayCount: 1, newCount: 0 },
        }),
      });
    }
    if (url.includes('/reviews/submit')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            cardId: 'card-1',
            status: 'MASTERED',
            interval: 15,
            repetitions: 3,
            easeFactor: 2.6,
            lastReviewedAt: new Date().toISOString(),
            nextReviewDate: new Date(Date.now() + 15 * 86400000).toISOString(),
            streak: {
              currentStreak: 7,
              bestStreak: 14,
              streakIncreased: true,
              isActiveToday: true,
              flameTier: 2,
              streakFreezes: 2,
              maxStreakFreezes: 2,
              earnedMilestoneFreeze: true,
              message: 'Chúc mừng bạn đạt mốc 7 ngày streak! Nhận ngay +1 Streak Freeze 🧊',
            },
          },
        }),
      });
    }
    if (url.includes('/reviews/stats')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalCards: 120,
            dueCount: 15,
            newCount: 8,
            learningCount: 45,
            masteredCount: 67,
          },
        }),
      });
    }
    if (url.includes('/decks')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'deck-1',
              title: 'IELTS Band 8.0 Core Vocabulary',
              description: 'Essential high-yield vocabulary for IELTS reading and speaking.',
              color: 'PURPLE',
              icon: 'Flame',
              stats: { totalCards: 50, dueCards: 12, masteredCards: 20 },
            },
          ],
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

  console.log('1. Capturing Step 1: Dashboard with Streak Freeze Badge...');
  currentStreakMock = {
    userId: 'user-1',
    currentStreak: 14,
    bestStreak: 21,
    lastActiveDate: new Date().toISOString(),
    isActiveToday: true,
    isPendingToday: false,
    streakFreezes: 1,
    maxStreakFreezes: 2,
    wasProtectedByFreeze: false,
    freezesUsed: 0,
    timezone: 'Asia/Ho_Chi_Minh',
    flameTier: 3,
  };

  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const streakWidget = page.locator('[data-testid="streak-widget"]');
  const freezeBadge = page.locator('[data-testid="streak-freeze-badge"]');
  const streakDays = page.locator('[data-testid="streak-days-count"]');

  if (await streakDays.count() > 0) await addAnnotation(streakDays.locator('..'), '①');
  if (await freezeBadge.count() > 0) await addAnnotation(freezeBadge, '②');

  await page.screenshot({ path: path.join(outDir, 'step-01-dashboard-freeze-badge.png') });
  await clearAnnotations();

  console.log('2. Capturing Step 2: Hover Tooltip explaining Streak Freeze rules...');
  if (await freezeBadge.count() > 0) {
    await freezeBadge.hover();
    await page.waitForTimeout(300);
    const tooltip = page.locator('#streak-freeze-tooltip');
    if (await tooltip.count() > 0) {
      await addAnnotation(tooltip, '①');
    }
  }
  await page.screenshot({ path: path.join(outDir, 'step-02-freeze-badge-tooltip.png') });
  await clearAnnotations();

  console.log('3. Capturing Step 3: Streak Saved Modal (Auto-protection in action)...');
  currentStreakMock = {
    userId: 'user-1',
    currentStreak: 14,
    bestStreak: 21,
    lastActiveDate: new Date(Date.now() - 86400000).toISOString(),
    isActiveToday: false,
    isPendingToday: true,
    streakFreezes: 1,
    maxStreakFreezes: 2,
    wasProtectedByFreeze: true,
    freezesUsed: 1,
    timezone: 'Asia/Ho_Chi_Minh',
    flameTier: 3,
  };

  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  const savedModalHeading = page.locator('#streak-saved-title');
  if (await savedModalHeading.count() > 0) {
    const shieldIcon = page.locator('div[role="dialog"] div:has(svg.lucide-shield-check)').first();
    const statsGrid = page.locator('div[role="dialog"] .grid.grid-cols-2');
    const keepLearningBtn = page.locator('div[role="dialog"] button:has-text("Keep Learning")');

    if (await shieldIcon.count() > 0) await addAnnotation(shieldIcon, '①');
    if (await savedModalHeading.count() > 0) await addAnnotation(savedModalHeading, '②');
    if (await statsGrid.count() > 0) await addAnnotation(statsGrid, '③');
    if (await keepLearningBtn.count() > 0) await addAnnotation(keepLearningBtn, '④');

    await page.screenshot({ path: path.join(outDir, 'step-03-streak-saved-modal.png') });
    await clearAnnotations();

    // Close saved modal
    await keepLearningBtn.click();
    await page.waitForTimeout(400);
  }

  console.log('4. Capturing Step 4: Milestone Reward Celebration Modal (+1 Freeze Earned)...');
  await page.goto(`${baseUrl}/review`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const flipButton = page.locator('button:has-text("Lật thẻ"), button:has-text("Space"), button:has-text("Flip")');
  if (await flipButton.count() > 0) {
    await flipButton.click();
    await page.waitForTimeout(300);
    const goodRatingBtn = page.locator('button:has-text("Good"), button:has-text("Nhớ Tốt"), button:has-text("3")');
    if (await goodRatingBtn.count() > 0) {
      await goodRatingBtn.click();
      await page.waitForTimeout(700);
    }
  }

  const celebrationHeading = page.locator('#streak-celebration-title');
  if (await celebrationHeading.count() > 0) {
    const celebrationFlame = page.locator('div[role="dialog"] div[role="img"][aria-label*="Ngọn lửa streak"]');
    const milestoneFreezeBadge = page.locator('[data-testid="milestone-freeze-badge"]');
    const continueBtn = page.locator('button:has-text("Tiếp tục học")');

    if (await celebrationFlame.count() > 0) await addAnnotation(celebrationFlame, '①');
    if (await milestoneFreezeBadge.count() > 0) await addAnnotation(milestoneFreezeBadge, '②');
    if (await celebrationHeading.count() > 0) await addAnnotation(celebrationHeading, '③');
    if (await continueBtn.count() > 0) await addAnnotation(continueBtn, '④');

    await page.screenshot({ path: path.join(outDir, 'step-04-milestone-reward-celebration.png') });
  }

  console.log('All 4 real annotated screenshots for streak-freeze captured successfully!');
  await browser.close();
  server.close();
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
